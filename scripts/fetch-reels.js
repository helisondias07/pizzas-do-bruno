/**
 * fetch-reels.js — ESBOÇO, NÃO LIGADO AO SITE.
 *
 * Busca os reels do Instagram do Bruno pela Instagram Graph API e devolve/grava
 * o reels.json que o site já lê: [{id, permalink, thumbnail_url, media_url, caption, timestamp}].
 * Também renova o token de longa duração (vale ~60 dias) antes de expirar.
 *
 * Variáveis de ambiente:
 *   IG_USER_ID        ID da conta profissional do Instagram (ID do "Instagram Business Account")
 *   IG_ACCESS_TOKEN   token de longa duração
 *   META_APP_ID       (opcional) ID do app da Meta — necessário p/ renovar token do login via Facebook
 *   META_APP_SECRET   (opcional) chave secreta do app — idem
 *   IG_LOGIN_MODE     "facebook" (padrão: conta ligada a uma Página) ou "instagram" (Instagram Login)
 *   GRAPH_VERSION     (opcional) padrão "v21.0"
 *
 * Funciona como:
 *   - Netlify Function agendada  → export default + export const config = { schedule: "@hourly" }
 *   - Cloudflare Worker          → export const worker = { fetch, scheduled } (com KV opcional: env.REELS_KV)
 *   - Node (build/cron local)    → `node scripts/fetch-reels.js > reels.json` (Node 18+, fetch nativo)
 *
 * O token renovado precisa ser guardado em algum lugar (KV, variável do painel, secret manager);
 * aqui ele só é devolvido em `newToken` e, no Worker, salvo no KV se existir.
 */

const FIELDS = 'id,media_type,media_product_type,permalink,thumbnail_url,media_url,caption,timestamp';
const MAX_REELS = 12;

function hosts(env) {
  const v = env.GRAPH_VERSION || 'v21.0';
  return (env.IG_LOGIN_MODE || 'facebook') === 'instagram'
    ? { api: `https://graph.instagram.com/${v}`, root: 'https://graph.instagram.com' }
    : { api: `https://graph.facebook.com/${v}`, root: `https://graph.facebook.com/${v}` };
}

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Graph API ${r.status}: ${(j.error && j.error.message) || 'erro'}`);
  return j;
}

/** Lista as mídias e mantém só REELS, no formato do reels.json. */
export async function fetchReels(env) {
  if (!env.IG_USER_ID || !env.IG_ACCESS_TOKEN) throw new Error('Faltam IG_USER_ID / IG_ACCESS_TOKEN');
  const { api } = hosts(env);
  let url = `${api}/${env.IG_USER_ID}/media?fields=${FIELDS}&limit=50&access_token=${encodeURIComponent(env.IG_ACCESS_TOKEN)}`;
  const out = [];
  for (let page = 0; url && page < 4 && out.length < MAX_REELS; page++) {
    const j = await getJSON(url);
    for (const m of j.data || []) {
      if (m.media_product_type !== 'REELS' || m.media_type !== 'VIDEO') continue;   // só reels, nada de stories/feed
      out.push({
        id: m.id,
        permalink: m.permalink,
        thumbnail_url: m.thumbnail_url,           // capa (poster)
        media_url: m.media_url || null,           // mp4; pode faltar se o reel tiver música com direitos
        caption: m.caption || '',
        timestamp: m.timestamp,
        media_product_type: 'REELS',
      });
      if (out.length >= MAX_REELS) break;
    }
    url = j.paging && j.paging.next;
  }
  // As URLs do CDN expiram; por isso a ideia é rodar de hora em hora (ou baixar as capas pro próprio site).
  return out;
}

/** Renova o token de longa duração. Devolve { access_token, expires_in } ou null. */
export async function refreshToken(env) {
  const { root } = hosts(env);
  if ((env.IG_LOGIN_MODE || 'facebook') === 'instagram') {
    return getJSON(`${root}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(env.IG_ACCESS_TOKEN)}`);
  }
  if (!env.META_APP_ID || !env.META_APP_SECRET) return null;          // sem app id/secret não dá pra renovar
  return getJSON(`${root}/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}` +
    `&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${encodeURIComponent(env.IG_ACCESS_TOKEN)}`);
}

export async function run(env, { refresh = false } = {}) {
  const reels = await fetchReels(env);
  let newToken = null;
  if (refresh) { try { newToken = await refreshToken(env); } catch (e) { console.warn('renovação do token falhou:', e.message); } }
  return { reels, newToken };
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900' };

/* ---------- Netlify (Functions v2, agendada) ---------- */
export default async function netlifyHandler(req) {
  const env = (globalThis.Netlify && Netlify.env.toObject()) || process.env;
  const { reels, newToken } = await run(env, { refresh: new Date().getUTCDate() % 7 === 0 }); // ~1x por semana
  if (newToken) console.log('Novo token gerado: atualize IG_ACCESS_TOKEN no painel/secret manager.');
  return new Response(JSON.stringify(reels), { headers: JSON_HEADERS });
}
export const config = { schedule: '@hourly' };

/* ---------- Cloudflare Worker ---------- */
export const worker = {
  // GET /reels.json → devolve o cache do KV (ou busca na hora)
  async fetch(request, env) {
    const cached = env.REELS_KV && await env.REELS_KV.get('reels.json');
    if (cached) return new Response(cached, { headers: JSON_HEADERS });
    const token = (env.REELS_KV && await env.REELS_KV.get('token')) || env.IG_ACCESS_TOKEN;
    const { reels } = await run({ ...env, IG_ACCESS_TOKEN: token });
    return new Response(JSON.stringify(reels), { headers: JSON_HEADERS });
  },
  // Cron Trigger (ex.: "0 * * * *"): atualiza o KV; renova o token 1x por semana
  async scheduled(event, env) {
    const token = (env.REELS_KV && await env.REELS_KV.get('token')) || env.IG_ACCESS_TOKEN;
    const { reels, newToken } = await run({ ...env, IG_ACCESS_TOKEN: token }, { refresh: new Date().getUTCDay() === 1 && new Date().getUTCHours() === 3 });
    if (env.REELS_KV) {
      await env.REELS_KV.put('reels.json', JSON.stringify(reels));
      if (newToken && newToken.access_token) await env.REELS_KV.put('token', newToken.access_token);
    }
  },
};

/* ---------- Node: node scripts/fetch-reels.js [--refresh] > reels.json ---------- */
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  run(process.env, { refresh: process.argv.includes('--refresh') })
    .then(({ reels, newToken }) => {
      process.stdout.write(JSON.stringify(reels, null, 1) + '\n');
      if (newToken) console.error('Novo token (guarde em IG_ACCESS_TOKEN):', newToken.access_token, 'expira em', newToken.expires_in, 's');
    })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
