// @ts-check
import { defineConfig } from 'astro/config';
import { copyFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/* Deploy:
   - Vercel: sem variáveis → base "/".
   - GitHub Pages (projeto): BASE_PATH=/pizzas-do-bruno/ SITE_URL=https://<usuario>.github.io npm run build */
const base = process.env.BASE_PATH || '/';
const site = process.env.SITE_URL || undefined;

/** reels.json: renderizado no build E publicado em /reels.json (o cliente rebusca; dá pra trocar sem rebuild). */
const REELS = fileURLToPath(new URL('./src/data/reels.json', import.meta.url));
const reelsJson = () => ({
  name: 'reels-json',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || req.url.split('?')[0] !== base.replace(/\/?$/, '/') + 'reels.json') return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(await readFile(REELS));
      });
    },
    'astro:build:done': async ({ dir }) => {
      await copyFile(REELS, new URL('reels.json', dir));
    },
  },
});

export default defineConfig({
  output: 'static',
  site,
  base,
  compressHTML: false,
  build: { inlineStylesheets: 'always' },
  integrations: [reelsJson()],
  vite: {
    // CSS sem reescrita do minificador (mantém a cascata/valores idênticos ao protótipo)
    build: { cssMinify: false, rollupOptions: { output: { entryFileNames: '_astro/[name].[hash].js' } } },
  },
});
