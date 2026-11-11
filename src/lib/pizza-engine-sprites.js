/* Sprites dos ingredientes do montador (PizzaViz).
   Cada ingrediente é um <symbol> 28×28 (viewBox -14..14) reutilizado por <use>, então o desenho
   pode ser caprichado sem multiplicar nós no DOM. Formas orgânicas (frango desfiado, cebola, folhas,
   lascas) são geradas por código com semente fixa: o resultado é sempre o mesmo, só que irregular
   como o ingrediente de verdade. Um ingrediente pode ter variações (array) — o motor alterna entre elas. */

/* ---------- utilitários ---------- */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function n(v) { return (Math.round(v * 10) / 10).toString(); }
function pt(p) { return n(p[0]) + ' ' + n(p[1]); }
/* curva suave fechada (Catmull-Rom → Bézier) */
function closed(pts) {
  var m = pts.length, d = 'M' + pt(pts[0]);
  for (var j = 0; j < m; j++) {
    var p0 = pts[(j - 1 + m) % m], p1 = pts[j], p2 = pts[(j + 1) % m], p3 = pts[(j + 2) % m];
    d += 'C' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return d + 'Z';
}
/* curva suave aberta */
function open(pts) {
  var m = pts.length, d = 'M' + pt(pts[0]);
  for (var j = 0; j < m - 1; j++) {
    var p0 = pts[Math.max(0, j - 1)], p1 = pts[j], p2 = pts[j + 1], p3 = pts[Math.min(m - 1, j + 2)];
    d += 'C' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
  }
  return d;
}
/* contorno irregular em volta de (cx,cy) */
function blobPts(cx, cy, rx, ry, k, wob, r, rot) {
  var out = [], c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  for (var i = 0; i < k; i++) {
    var a = i / k * Math.PI * 2, f = 1 + (r() - .5) * wob, x = Math.cos(a) * rx * f, y = Math.sin(a) * ry * f;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}
function blob(cx, cy, rx, ry, k, wob, r, rot) { return closed(blobPts(cx, cy, rx, ry, k, wob, r, rot)); }
function P(d, a) { var s = '<path d="' + d + '"'; for (var k in a) s += ' ' + k + '="' + a[k] + '"'; return s + '/>'; }
function E(cx, cy, rx, ry, a, rot) { var s = '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"'; if (rot) s += ' transform="rotate(' + n(rot) + ' ' + n(cx) + ' ' + n(cy) + ')"'; for (var k in a) s += ' ' + k + '="' + a[k] + '"'; return s + '/>'; }
function Ci(cx, cy, r, a) { var s = '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"'; for (var k in a) s += ' ' + k + '="' + a[k] + '"'; return s + '/>'; }
function shadow(d, dx, dy, col, op) { return P(d, { fill: col, opacity: op, transform: 'translate(' + n(dx) + ' ' + n(dy) + ')' }); }

/* fiapo (frango desfiado, lascas de queijo, atum...): fita afunilada, levemente curva e irregular */
function strand(r, ax, ay, ang, len, w) {
  var bend = (r() - .5) * len * (w < 2.2 ? .16 : .55), c = Math.cos(ang), s = Math.sin(ang), K = 9, L = [], R = [], mid = [];
  for (var i = 0; i <= K; i++) {
    var t = i / K, x = (t - .5) * len, y = bend * 4 * t * (1 - t) + Math.sin(t * 7 + ax) * .35;
    // tangente aproximada para a normal
    var t2 = Math.min(1, t + .02), t1 = Math.max(0, t - .02), dx = (t2 - t1) * len, dy = bend * 4 * ((t2 * (1 - t2)) - (t1 * (1 - t1))), dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
    var ww = w * (.28 + .72 * Math.pow(Math.sin(Math.PI * t), .55)) * (.8 + r() * .4) / 2;
    var gx = ax + x * c - y * s, gy = ay + x * s + y * c, gnx = nx * c - ny * s, gny = nx * s + ny * c;
    L.push([gx + gnx * ww, gy + gny * ww]); R.push([gx - gnx * ww, gy - gny * ww]); mid.push([gx, gy]);
  }
  return { d: closed(L.concat(R.reverse())), mid: mid, w: w };
}

/* ---------- gradientes (ids globais do SVG da pizza) ---------- */
export const GRADS =
  '<radialGradient id="gCal" cx="42%" cy="38%" r="68%"><stop offset="0" stop-color="#D8644C"/><stop offset=".7" stop-color="#BA4230"/><stop offset="1" stop-color="#8F2C1E"/></radialGradient>' +
  '<radialGradient id="gTom" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#FF6A50"/><stop offset=".65" stop-color="#E0302A"/><stop offset="1" stop-color="#A3161C"/></radialGradient>' +
  '<radialGradient id="gTomIn" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#FFB49C"/><stop offset=".55" stop-color="#F56A52"/><stop offset="1" stop-color="#E4443A"/></radialGradient>' +
  '<radialGradient id="gOli" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#6A5560"/><stop offset=".45" stop-color="#2E2228"/><stop offset="1" stop-color="#0E0A0C"/></radialGradient>' +
  '<radialGradient id="gEgg" cx="42%" cy="38%" r="62%"><stop offset="0" stop-color="#FFE48E"/><stop offset=".7" stop-color="#F7C845"/><stop offset="1" stop-color="#E9AE2E"/></radialGradient>' +
  '<radialGradient id="gEggW" cx="44%" cy="40%" r="62%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".8" stop-color="#FBF7EC"/><stop offset="1" stop-color="#E9DFC9"/></radialGradient>' +
  '<radialGradient id="gLom" cx="42%" cy="38%" r="66%"><stop offset="0" stop-color="#F6B6AE"/><stop offset=".75" stop-color="#E4928A"/><stop offset="1" stop-color="#C96C65"/></radialGradient>' +
  '<radialGradient id="gHam" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#F9BEC2"/><stop offset=".8" stop-color="#EE9EA6"/><stop offset="1" stop-color="#D98390"/></radialGradient>' +
  '<radialGradient id="gBan" cx="46%" cy="42%" r="62%"><stop offset="0" stop-color="#FFF7D6"/><stop offset=".75" stop-color="#F9E6AE"/><stop offset="1" stop-color="#EBC977"/></radialGradient>' +
  '<radialGradient id="gMor" cx="40%" cy="32%" r="76%"><stop offset="0" stop-color="#FF5A5A"/><stop offset=".7" stop-color="#D81E2C"/><stop offset="1" stop-color="#A40F1E"/></radialGradient>' +
  '<radialGradient id="gMorIn" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFE6E0"/><stop offset=".5" stop-color="#FF9D94"/><stop offset="1" stop-color="#F0504F"/></radialGradient>' +
  '<radialGradient id="gCat" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FFFBF1"/><stop offset="1" stop-color="#EEDDBE"/></radialGradient>' +
  '<radialGradient id="gFra" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F3D7A8"/><stop offset="1" stop-color="#D3A064"/></radialGradient>' +
  '<radialGradient id="gGoi" cx="32%" cy="26%" r="85%"><stop offset="0" stop-color="#D2405A"/><stop offset=".6" stop-color="#A21F36"/><stop offset="1" stop-color="#6E0E1E"/></radialGradient>' +
  '<radialGradient id="gProv" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#FFE7A0"/><stop offset=".7" stop-color="#F7CB62"/><stop offset="1" stop-color="#E2A440"/></radialGradient>' +
  '<radialGradient id="gAba" cx="50%" cy="10%" r="95%"><stop offset="0" stop-color="#FFF0A8"/><stop offset=".55" stop-color="#F8D152"/><stop offset="1" stop-color="#E9AE2C"/></radialGradient>' +
  '<radialGradient id="gMil" cx="42%" cy="30%" r="70%"><stop offset="0" stop-color="#FFE477"/><stop offset=".7" stop-color="#F4BE2A"/><stop offset="1" stop-color="#D9971A"/></radialGradient>' +
  '<radialGradient id="gCha" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#FBF1DE"/><stop offset=".8" stop-color="#EEDCBC"/><stop offset="1" stop-color="#DCC197"/></radialGradient>' +
  '<radialGradient id="gWch" gradientUnits="userSpaceOnUse" cx="186" cy="180" r="168"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".55" stop-color="#FDF3DF"/><stop offset=".86" stop-color="#F6E3C0"/><stop offset="1" stop-color="#E9CB98"/></radialGradient>' +
  '<linearGradient id="gLeafL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6DB14E"/><stop offset="1" stop-color="#3F8030"/></linearGradient>' +
  '<linearGradient id="gLeafR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3E7E2C"/><stop offset="1" stop-color="#245A1C"/></linearGradient>';

/* ---------- frango desfiado: tufos de fiapos alongados, dourado/bege, com fibras ---------- */
function frango(seed) {
  var r = rng(seed), out = '', sh = '', body = '', fib = '', base = r() * Math.PI, k = 14 + (r() * 4 | 0);
  var cols = ['#E8C48A', '#D7B06A', '#F3D7A4', '#C99858', '#E6C07A', '#F7E2B4'];
  for (var i = 0; i < k; i++) {
    var a = base + (r() - .5) * .8, rr = Math.sqrt(r()) * 8.2, th = r() * Math.PI * 2;
    var S = strand(r, Math.cos(th) * rr, Math.sin(th) * rr * .85, a, 7 + r() * 6, 1.05 + r() * .75), col = cols[i % cols.length];
    sh += P(S.d, {});
    body += P(S.d, { fill: col, stroke: '#9A6230', 'stroke-width': '.55', 'stroke-linejoin': 'round' });
    // fibras: linhas claras e escuras correndo ao longo do fiapo
    var m = S.mid, off = S.w * .2;
    // fibras: linhas paralelas ao eixo do fiapo (deslocadas pela normal), uma clara e uma escura
    function along(o, from, to) { var q = []; for (var j = from; j < m.length - to; j++) { var pa = m[Math.max(0, j - 1)], pb = m[Math.min(m.length - 1, j + 1)], dx = pb[0] - pa[0], dy = pb[1] - pa[1], dl = Math.hypot(dx, dy) || 1; q.push([m[j][0] - dy / dl * o, m[j][1] + dx / dl * o]); } return open(q); }
    fib += P(along(-off, 1, 1), { fill: 'none', stroke: '#F9E6C2', 'stroke-width': '.5', 'stroke-linecap': 'round', opacity: '.75' });
    if (S.w > 3.4) fib += P(along(off * 1.1, 2, 2), { fill: 'none', stroke: '#A8702F', 'stroke-width': '.45', 'stroke-linecap': 'round', opacity: '.6' });
    if (r() > .45) { var q = m[2 + (r() * 5 | 0)]; fib += E(q[0], q[1], .9, .45, { fill: '#A8692F', opacity: '.45' }, a * 57.3); }
    body += fib; fib = ''; // fibras logo após o próprio fiapo: o fiapo de cima cobre as do de baixo
  }
  out = '<g transform="translate(.8 1.3)" fill="#5A3208" opacity=".26">' + sh + '</g>' + body + fib;
  return out;
}

/* ---------- catupiry: porção cremosa aplicada com bisnaga, com a espiral marcada ---------- */
function catupiry(seed) {
  var r = rng(seed), d = blob(0, 0, 9.2, 8.4, 9, .26, r, r() * 6), sp = [], turns = 1.7 + r() * .4, ph = r() * 6;
  for (var i = 0; i <= 26; i++) { var t = i / 26, a = ph + t * turns * Math.PI * 2, rr = 6.4 * (1 - t) + .6; sp.push([Math.cos(a) * rr - .4, Math.sin(a) * rr * .9 - .6]); }
  var sd = open(sp);
  return shadow(d, .9, 1.6, '#7A5A30', '.2') + P(d, { fill: 'url(#gCat)' }) +
    P(d, { fill: 'none', stroke: '#E3CFA8', 'stroke-width': '.7', opacity: '.8' }) +
    E(4.6, 4, 2.8, 1.6, { fill: '#E9C27A', opacity: '.28' }, 30) +
    P(sd, { fill: 'none', stroke: '#E6D4B0', 'stroke-width': '1.5', 'stroke-linecap': 'round', opacity: '.9', transform: 'translate(.5 .7)' }) +
    P(sd, { fill: 'none', stroke: '#FFFFFF', 'stroke-width': '1.1', 'stroke-linecap': 'round' }) +
    E(-3.6, -4.2, 2.4, 1.1, { fill: '#fff' }, -30);
}

/* ---------- calabresa: rodela com borda escura (tripa), pontinhos de gordura e pimenta ---------- */
function calabresa(seed) {
  var r = rng(seed), out = '', ry = 9.4 + r() * .8;
  out += E(.9, 1.6, 10.3, ry + .2, { fill: '#3A1206', opacity: '.25' });
  out += E(0, 0, 10.3, ry + .2, { fill: '#5E1A0E' });
  out += E(0, 0, 9.3, ry - .8, { fill: 'url(#gCal)' });
  out += E(0, 0, 8.4, ry - 1.7, { fill: 'none', stroke: '#8A2A1A', 'stroke-width': '1.4', opacity: '.35' });
  for (var i = 0; i < 13; i++) { var a = r() * 6.283, rr = Math.sqrt(r()) * 7, s = .45 + r() * 1.25; out += E(Math.cos(a) * rr, Math.sin(a) * rr * .92, s, s * (.6 + r() * .4), { fill: r() > .35 ? '#F6D2BE' : '#E9AE96', opacity: '.92' }, r() * 180); }
  for (var j = 0; j < 6; j++) { var b = r() * 6.283, q = Math.sqrt(r()) * 7; out += Ci(Math.cos(b) * q, Math.sin(b) * q, .32 + r() * .28, { fill: '#5A140A', opacity: '.8' }); }
  out += P('M-7.2-4.6A8.6 8.6 0 0 1 1.4-8.4', { fill: 'none', stroke: '#fff', 'stroke-width': '1.1', 'stroke-linecap': 'round', opacity: '.3' });
  return out;
}

/* ---------- bacon: tira ondulada, faixas de carne e gordura, bordas tostadas ---------- */
function bacon(seed) {
  var r = rng(seed), L = 11.5 + r() * 1.8, ph = r() * 6, amp = 1.3 + r() * .8, top = [], bot = [], l1 = [], l2 = [], hi = [];
  for (var i = 0; i <= 12; i++) {
    var t = i / 12, x = -L + t * 2 * L, y = amp * Math.sin(t * 6.5 + ph);
    var w = 3.9 + (r() - .5) * .5;
    top.push([x, y - w]); bot.push([x, y + w]);
    l1.push([x, y - 2.5 + Math.sin(t * 9 + ph) * .45]); l2.push([x, y + 1.6 + Math.sin(t * 8 - ph) * .5]); hi.push([x, y - .4]);
  }
  var d = closed(top.concat(bot.slice().reverse()));
  function band(ln, wd) { var a = [], b = []; ln.forEach(function (p, j) { var ww = wd * (.8 + .4 * Math.sin(j * 1.7)); a.push([p[0], p[1] - ww]); b.push([p[0], p[1] + ww]); }); return closed(a.concat(b.reverse())); }
  return shadow(d, .8, 1.5, '#3A1206', '.22') + P(d, { fill: '#F2CDB2' }) +
    P(band(l1, 1.15), { fill: '#B5503A' }) + P(band(l2, 1.45), { fill: '#A2412D' }) +
    P(open(hi), { fill: 'none', stroke: '#FBE4D2', 'stroke-width': '.7', opacity: '.8' }) +
    P(d, { fill: 'none', stroke: '#7E301C', 'stroke-width': '.9', 'stroke-linejoin': 'round', opacity: '.75' }) +
    E(L * .5, -1, 1.6, .7, { fill: '#6E2614', opacity: '.35' }, 10) + E(-L * .6, 1.8, 1.2, .6, { fill: '#6E2614', opacity: '.3' });
}

/* ---------- ovo cozido em rodelas ---------- */
function ovo(half) {
  var white = half ? 'M-9 1.2A9 8 0 0 1 9 1.2Q0 3 -9 1.2Z' : 'M-9.4 0A9.4 8.2 0 1 0 9.4 0A9.4 8.2 0 1 0 -9.4 0Z';
  var yolk = half ? 'M-4.6 1.6A4.6 4.6 0 0 1 4.6 1.6Q0 2.6-4.6 1.6Z' : 'M-4.8 .2A4.8 4.6 0 1 0 4.8 .2A4.8 4.6 0 1 0-4.8 .2Z';
  var dots = half ? [[-1.6, -.6], [1.4, -1.6], [.4, .4]] : [[-1.6, -1.2], [1.8, -.4], [.2, 2], [-2.4, 1.4], [1.2, -2.6]];
  return shadow(white, .8, 1.5, '#6A4A20', '.2') + P(white, { fill: 'url(#gEggW)', stroke: '#E3D7BE', 'stroke-width': '.6' }) +
    P(yolk, { fill: 'url(#gEgg)', stroke: '#E0A52A', 'stroke-width': '.6' }) +
    dots.map(function (p) { return Ci(p[0], p[1], .5, { fill: '#E5A22A', opacity: '.55' }); }).join('') +
    (half ? '' : E(-4.6, -4.6, 2.4, 1, { fill: '#fff', opacity: '.9' }, -35));
}

/* ---------- tomate cereja cortado ao meio: pele, polpa e lóculos com sementes ---------- */
function tomate(seed) {
  var r = rng(seed), out = Ci(.8, 1.4, 8.4, { fill: '#4A0E0A', opacity: '.22' }) + Ci(0, 0, 8.3, { fill: 'url(#gTom)' }) + Ci(0, 0, 7, { fill: '#F25A44' }), k = r() > .5 ? 3 : 2, a0 = r() * 6.28, w = Math.PI / k * .62;
  for (var i = 0; i < k; i++) {
    var a = a0 + i / k * Math.PI * 2, p = [];
    // câmara em cunha (gel claro) entre as paredes de polpa
    [[1.6, a - w * .55], [5.9, a - w], [6.1, a], [5.9, a + w], [1.6, a + w * .55]].forEach(function (q) { p.push([Math.cos(q[1]) * q[0], Math.sin(q[1]) * q[0]]); });
    out += P(closed(p), { fill: '#FFA184', stroke: '#E44A38', 'stroke-width': '.4' });
    for (var j = -1; j <= 1; j++) { var aa = a + j * w * .45, rr = 4 - Math.abs(j) * .5; out += E(Math.cos(aa) * rr, Math.sin(aa) * rr, .8, .48, { fill: '#FFEBC0', stroke: '#E9B27A', 'stroke-width': '.2' }, aa * 57.3); }
  }
  out += Ci(0, 0, 1.5, { fill: '#FFC0A6' });
  out += P('M-6.8-3.6A7.6 7.6 0 0 1-1.6-7.4', { fill: 'none', stroke: '#fff', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '.5' });
  return out;
}

/* ---------- cebola roxa: anéis e meias-luas translúcidas ---------- */
function cebola(kind) {
  function arc(rx, ry, a0, a1) { var p = []; for (var i = 0; i <= 14; i++) { var a = a0 + (a1 - a0) * i / 14; p.push([Math.cos(a) * rx, Math.sin(a) * ry]); } return open(p); }
  var spans = kind === 0 ? [[9.2, 8.6, 3.4, 9.1], [6.4, 6, 3.6, 8.8]] : kind === 1 ? [[8.8, 8.2, 0, 6.283]] : [[9.4, 8.6, 3.2, 6.6], [6.6, 6, 3.6, 6.2]];
  var sh = '', out = '';
  spans.forEach(function (s) {
    var d = arc(s[0], s[1], s[2], s[3]);
    sh += P(d, { fill: 'none', stroke: '#2A0820', 'stroke-width': '3', 'stroke-linecap': 'round', opacity: '.18', transform: 'translate(.7 1.2)' });
    out += P(d, { fill: 'none', stroke: '#87326F', 'stroke-width': '2.6', 'stroke-linecap': 'round' }) +
      P(d, { fill: 'none', stroke: '#F6E6F0', 'stroke-width': '1.75', 'stroke-linecap': 'round', opacity: '.8' }) +
      P(d, { fill: 'none', stroke: '#fff', 'stroke-width': '.5', 'stroke-linecap': 'round', opacity: '.6', transform: 'translate(-.25 -.3)' });
  });
  return sh + out;
}

/* ---------- azeitona preta inteira, brilhosa, com o furo do caroço ---------- */
function azeitona(v) {
  var rot = v ? -25 : 20;
  return E(.8, 1.3, 6.7, 5.6, { fill: '#1A0E06', opacity: '.28' }, rot) + E(0, 0, 6.6, 5.5, { fill: 'url(#gOli)' }, rot) +
    E(v ? 1.4 : .9, v ? .4 : .6, 1.9, 1.5, { fill: '#160E12', stroke: '#5A4650', 'stroke-width': '.6' }, rot) +
    E(-2.8, -2.4, 2.2, .9, { fill: '#fff', opacity: '.5' }, rot - 10) + Ci(-1.4, -3.1, .5, { fill: '#fff', opacity: '.85' });
}

/* ---------- pimentão verde: gomo cheio (polpa clara + pele) ou tira curva ---------- */
function pimentao(seed, strip) {
  var r = rng(seed), a0 = (r() - .5) * .4, span = strip ? 1.9 : 2.35, p = [], inn = [], M = 14;
  for (var i = 0; i <= M; i++) {
    var t = i / M, a = a0 + span * (t - .5), wob = 1 + Math.sin(t * Math.PI) * .18, rr = (strip ? 9.4 : 10.2) * wob;
    p.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    inn.push([Math.cos(a) * (rr - (strip ? 3.6 : 4.6)), Math.sin(a) * (rr - (strip ? 3.6 : 4.6))]);
  }
  var d = closed(p.concat(inn.slice().reverse()));
  return shadow(d, .8, 1.3, '#10200A', '.22') +
    P(d, { fill: '#3F8A28', stroke: '#1E4E14', 'stroke-width': '.7', 'stroke-linejoin': 'round' }) +
    P(closed(inn.concat(p.slice(4, 10).reverse())), { fill: '#C5E89A', opacity: '.9' }) +
    P(open(inn.slice(2, -2)), { fill: 'none', stroke: '#E8F6C8', 'stroke-width': '.8', 'stroke-linecap': 'round', opacity: '.8' }) +
    E(Math.cos(a0) * 6.2, Math.sin(a0) * 6.2, 1.1, .55, { fill: '#F4E7A8', opacity: '.7' }, a0 * 57) +
    P(open(p.slice(1, -1)), { fill: 'none', stroke: '#8FCB5A', 'stroke-width': '1.1', 'stroke-linecap': 'round', opacity: '.7', transform: 'translate(-.3 -.4)' });
}

/* ---------- milho: grão em forma de dente, coroa clara ---------- */
function milho(v) {
  var d = v ? 'M-3-1.6C-3-3.6 3-3.6 3-1.6 3 .8 1.6 3.2 0 3.2S-3 .8-3-1.6Z' : 'M-3.1-1.9C-2.6-3.5 2.6-3.5 3.1-1.9 3.2 .3 2 2.9 0 3.1-2 2.9-3.2.3-3.1-1.9Z';
  return shadow(d, .4, .7, '#6A4A10', '.25') + P(d, { fill: 'url(#gMil)', stroke: '#C98A16', 'stroke-width': '.35' }) +
    E(0, 2.1, 1.3, .75, { fill: '#FBEBB8', opacity: '.9' }) + E(-1, -1.5, 1.2, .6, { fill: '#fff', opacity: '.6' }, -15);
}

/* ---------- lombo canadense: fatia rosada com faixa de gordura e fibras ---------- */
function lombo(seed) {
  var r = rng(seed), outer = blob(0, 0, 10.6, 9.8, 10, .1, r), inner = blob(-.5, .5, 9.2, 8.6, 10, .1, r), out = '';
  out += shadow(outer, .9, 1.6, '#5A2018', '.22') + P(outer, { fill: '#F6DCCF', stroke: '#D9A797', 'stroke-width': '.6' }) + P(inner, { fill: 'url(#gLom)' });
  for (var i = 0; i < 3; i++) { var y = -4 + i * 3.6 + r(); out += P('M' + n(-6 + r()) + ' ' + n(y) + 'q' + n(3 + r()) + ' ' + n(-1.6) + ' ' + n(6.5 + r()) + ' ' + n(.4), { fill: 'none', stroke: '#C86C66', 'stroke-width': '.55', opacity: '.4', 'stroke-linecap': 'round' }); }
  out += E(5.4, 5.4, 2.4, 1.2, { fill: '#B56A50', opacity: '.22' }, 40) + E(-3, -3.6, 3.6, 1.6, { fill: '#FFE4DE', opacity: '.55' }, -25);
  return out;
}

/* ---------- abacaxi: pedaço em cunha com fibras e ponta caramelizada ---------- */
function abacaxi(v) {
  var d = v ? 'M-6.4-5.6Q0-7.6 6.4-5.6L7.2 5.2Q0 7.6-7.2 5.2Z' : 'M-1.6-8.6Q0-9.2 1.6-8.6L8.4 5.8Q0 9.4-8.4 5.8Z';
  var fib = v ? 'M-4-4.6L-4.6 5.4M-1.3-5.2L-1.5 6.2M1.4-5.2L1.6 6.2M4.1-4.6L4.7 5.4' : 'M-.6-6.6L-4.6 6.2M.6-6.6L-1.4 7.2M1.6-6.2L2.2 7.1M2.4-5.2L5.4 6.4';
  return shadow(d, .8, 1.5, '#6A4A10', '.2') + P(d, { fill: 'url(#gAba)', stroke: '#D69A22', 'stroke-width': '.6', 'stroke-linejoin': 'round' }) +
    P(fib, { stroke: '#E2A42C', 'stroke-width': '.6', opacity: '.6', 'stroke-linecap': 'round' }) +
    P(v ? 'M-7.2 5.2Q0 7.6 7.2 5.2' : 'M-8.4 5.8Q0 9.4 8.4 5.8', { fill: 'none', stroke: '#B97418', 'stroke-width': '1.4', opacity: '.55', 'stroke-linecap': 'round' }) +
    P(v ? 'M-4.4-4.4Q0-5.6 4.4-4.4' : 'M-.8-6.6Q0-7 .8-6.6', { fill: 'none', stroke: '#FFF6C8', 'stroke-width': '1.1', 'stroke-linecap': 'round', opacity: '.9' });
}

/* ---------- geleia de pimenta: gota brilhante e translúcida com flocos de pimenta ---------- */
function geleia(seed) {
  var r = rng(seed), d = blob(0, 0, 6, 5.2, 8, .3, r, r() * 6), out = shadow(d, .7, 1.2, '#4A0A06', '.2') + P(d, { fill: '#D93A22', opacity: '.86' }) + P(d, { fill: 'none', stroke: '#A8200F', 'stroke-width': '.7', opacity: '.6' });
  for (var i = 0; i < 4; i++) { var a = r() * 6.28, q = r() * 3.6; out += E(Math.cos(a) * q, Math.sin(a) * q, .8, .4, { fill: i % 2 ? '#7E1208' : '#FFD39A', opacity: '.85' }, r() * 180); }
  return out + E(-2, -2, 1.8, .9, { fill: '#FFD2C0', opacity: '.85' }, -30) + Ci(1.8, -2.4, .45, { fill: '#fff', opacity: '.8' });
}

/* ---------- champignon fatiado: perfil de cogumelo com chapéu e lamelas ---------- */
function champignon(v) {
  var d = v ? 'M-9.2 1C-9.6-5.4-4.6-8.4 0-8.4S9.4-5.6 9 .8C8 2.4 4.6 2 3 2.2L3.4 6.8C3.4 8.4-3.6 8.4-3.4 6.6L-2.8 2.2C-4.6 2-8.2 2.6-9.2 1Z'
    : 'M-9.6 1.4C-9.4-5-4.4-8 .4-8 5.2-8 9.6-4.8 9.4 1.2 8.4 2.8 5 2.4 3.2 2.6L3.6 7.2C3.6 8.6-3.2 8.6-3.2 7.2L-2.8 2.6C-5 2.6-8.8 3-9.6 1.4Z';
  return shadow(d, .8, 1.5, '#5A4020', '.22') + P(d, { fill: 'url(#gCha)', stroke: '#9C7A52', 'stroke-width': '.8', 'stroke-linejoin': 'round' }) +
    P(v ? 'M-8.4-.2C-8.4-5-4.2-7.4 0-7.4S8.4-5 8.2-.4' : 'M-8.8.4C-8.6-4.4-4.2-7 .4-7 4.8-7 8.8-4.4 8.6.2', { fill: 'none', stroke: '#B8946A', 'stroke-width': '1.2', opacity: '.6' }) +
    P('M-7.6 1.1Q0-.6 7.6 1.1', { fill: 'none', stroke: '#A98558', 'stroke-width': '1.1', opacity: '.7' }) +
    P('M-5.4 1.5l.5-1M-2.6 1.1l.3-1M1.4 1.1l-.2-1M4.4 1.4l-.4-1', { stroke: '#9C7A52', 'stroke-width': '.4', opacity: '.6' }) +
    P('M-.4 2.8L-.6 7', { stroke: '#D8C29C', 'stroke-width': '.8', 'stroke-linecap': 'round', opacity: '.8' }) +
    E(-3.4, -4.4, 2.6, 1, { fill: '#fff', opacity: '.55' }, -18) + E(5.6, -2.4, 1.2, .6, { fill: '#B07E46', opacity: '.3' }, 30);
}

/* ---------- alho laminado frito: lascas douradas com borda tostada ---------- */
function alho(v) {
  var d = v ? 'M-4.8.2C-4.8-2.6-1.6-3.6.6-3.4 3.4-3.1 5-1.4 4.6.8 4.2 2.8 1.4 3.6-.8 3.4-3.4 3.2-4.8 2.2-4.8.2Z' : 'M-4.2-.6C-3.6-3 1-3.8 3.4-2.4 5.2-1.2 4.6 1.8 2.6 2.8.2 3.8-4.6 2.6-4.2-.6Z';
  return shadow(d, .5, .9, '#6A4A20', '.22') + P(d, { fill: '#F4D592', stroke: '#C2852E', 'stroke-width': '.8' }) +
    E(0, 0, 2.8, 1.8, { fill: '#FCEFC9', opacity: '.95' }, v ? 5 : -8) + P(v ? 'M-2.2.4Q0-.4 2.4.2' : 'M-2 .2Q0-.6 2.2-.2', { fill: 'none', stroke: '#D9A250', 'stroke-width': '.5', 'stroke-linecap': 'round' });
}

/* ---------- presunto: fatia rosada dobrada/rasgada com veios e borda de gordura ---------- */
function presunto(seed) {
  // fatia fina de presunto dobrada: retângulo de cantos moles, borda de gordura clara num lado e a dobra sombreada
  var r = rng(seed), rot = (r() - .5) * .5, pts = blobPts(0, 0, 10.6, 7, 12, .1, r, rot), d = closed(pts);
  var out = shadow(d, .8, 1.5, '#6A2030', '.2') + P(d, { fill: 'url(#gHam)' });
  out += P(open(pts.slice(6, 11)), { fill: 'none', stroke: '#FFF0EE', 'stroke-width': '1.9', 'stroke-linecap': 'round' });
  out += P(open(pts.slice(6, 11)), { fill: 'none', stroke: '#F4C6CB', 'stroke-width': '.5', 'stroke-linecap': 'round', transform: 'translate(0 1.1)' });
  var fx = (r() - .5) * 4, c = Math.cos(rot), sn = Math.sin(rot);
  function T(x, y) { return [x * c - y * sn, x * sn + y * c]; }
  var fold = [T(fx - 1.2, -6.6), T(fx + .4, -2), T(fx - .2, 2.6), T(fx + 1, 6.8)];
  out += P(open(fold), { fill: 'none', stroke: '#D9808E', 'stroke-width': '1.1', 'stroke-linecap': 'round', opacity: '.55' });
  out += P(open(fold), { fill: 'none', stroke: '#FFD9DC', 'stroke-width': '.8', 'stroke-linecap': 'round', opacity: '.8', transform: 'translate(1 0)' });
  for (var i = 0; i < 5; i++) { var q = T((r() - .5) * 14, (r() - .5) * 8); out += E(q[0], q[1], .6 + r() * 1.1, .4 + r() * .5, { fill: '#FAD0D4', opacity: '.7' }, r() * 180); }
  return out + P(d, { fill: 'none', stroke: '#D47D8A', 'stroke-width': '.6', opacity: '.7' });
}

/* ---------- manjericão: folha com nervuras, um lado mais claro (folha côncava) ---------- */
function manjericao(v) {
  var d = v ? 'M0-11C6.6-6.4 7.4 4.4 .4 10.6-6.6 4.8-6.8-6.4 0-11Z' : 'M0-10.6C6-6.8 6.8 3.8 0 10.4-6.6 4.4-6.2-6.8 0-10.6Z', l = v ? 'M0-11C-6.8-6.4-6.6 4.8.4 10.6.8 2 .6-5 0-11Z' : 'M0-10.6C-6.2-6.8-6.6 4.4 0 10.4.6 2 .5-5 0-10.6Z';
  return shadow(d, .9, 1.4, '#10200A', '.22') + P(d, { fill: 'url(#gLeafR)' }) + P(l, { fill: 'url(#gLeafL)' }) +
    P('M0-9.6C.6-3 .7 3 .3 9.6M.2-5.2C2.4-5.6 3.6-6.4 4.4-7.4M.4-1C2.8-1.4 4.4-2.4 5.4-3.6M.4 3.4C2.6 3.2 4.2 2.2 4.8 1M.1-5.4C-2-5.8-3.2-6.6-4-7.6M.2-1.2C-2.4-1.6-4-2.6-5-3.8M.3 3.2C-2 3-3.6 2-4.4.8', { fill: 'none', stroke: '#A9DC8A', 'stroke-width': '.55', 'stroke-linecap': 'round', opacity: '.85' }) +
    P('M-3.4-6.2C-4.6-3.6-4.4-.4-3.6 1.6', { fill: 'none', stroke: '#fff', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '.25' }) +
    P('M.3 10.2L.6 12.6', { stroke: '#3E7E2C', 'stroke-width': '.9', 'stroke-linecap': 'round' });
}

/* ---------- parmesão ralado: lascas finas palha ---------- */
function parmesao(seed) {
  var r = rng(seed), out = '', sh = '';
  for (var i = 0; i < 4; i++) { var a = r() * 6.28, S = strand(r, (r() - .5) * 4, (r() - .5) * 4, a, 5 + r() * 4, 1.4 + r() * .8); sh += P(S.d, {}); out += P(S.d, { fill: i % 2 ? '#FFF6D8' : '#F6E2A6', stroke: '#B99A50', 'stroke-width': '.45' }); }
  return '<g transform="translate(.4 .7)" fill="#6A4A10" opacity=".2">' + sh + '</g>' + out;
}

/* ---------- provolone: pedaço derretido, dourado, com pontos tostados ---------- */
function provolone(seed) {
  var r = rng(seed), d = blob(0, 0, 9, 7.4, 10, .32, r, r() * 6), out = shadow(d, .5, .9, '#6A4A10', '.16') + P(d, { fill: 'url(#gProv)', stroke: '#D08E34', 'stroke-width': '.6' });
  // provolone derretido: placa dourada com casquinha tostada e bolhinhas
  for (var i = 0; i < 4; i++) { var a = r() * 6.28, q = 2 + r() * 4; out += E(Math.cos(a) * q, Math.sin(a) * q * .8, 1 + r() * 1.4, .7 + r() * .7, { fill: '#B8691F', opacity: '.35' }, r() * 180); }
  out += Ci(-2.6, 2, 1.3, { fill: 'none', stroke: '#E0A04A', 'stroke-width': '.5', opacity: '.8' }) + Ci(3, -2.2, .9, { fill: 'none', stroke: '#E0A04A', 'stroke-width': '.5', opacity: '.8' });
  return out + E(-2.6, -2.6, 3, 1.2, { fill: '#FFF5D0', opacity: '.75' }, -20);
}

/* ---------- gorgonzola: pedacinho esfarelado, branco com veios azul-esverdeados ---------- */
function gorgonzola(seed) {
  var r = rng(seed), d = blob(0, 0, 5.4, 4.4, 7, .45, r, r() * 6), out = shadow(d, .5, .9, '#4A4A3A', '.22') + P(d, { fill: '#F5F2E4', stroke: '#D6CFB4', 'stroke-width': '.5' });
  for (var i = 0; i < 4; i++) { var a = r() * 6.28, q = r() * 2.6; out += E(Math.cos(a) * q, Math.sin(a) * q, .6 + r() * .7, .4 + r() * .4, { fill: i % 2 ? '#56777F' : '#7F9FA4', opacity: '.9' }, r() * 180); }
  return out + E(-1.6, -1.6, 1.4, .6, { fill: '#fff', opacity: '.8' }, -20);
}

/* ---------- banana: rodela creme, centro com as sementinhas ---------- */
function banana() {
  return Ci(.8, 1.5, 9.2, { fill: '#6A4A10', opacity: '.2' }) + Ci(0, 0, 9.1, { fill: 'url(#gBan)' }) + Ci(0, 0, 8.4, { fill: 'none', stroke: '#E2C277', 'stroke-width': '1.2', opacity: '.9' }) +
    P('M0 0L0-3.4M0 0L2.9 1.7M0 0L-2.9 1.7', { stroke: '#E6CB8C', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '.8' }) +
    Ci(0, -2.2, .55, { fill: '#5E3E24' }) + Ci(1.9, 1.1, .55, { fill: '#5E3E24' }) + Ci(-1.9, 1.1, .55, { fill: '#5E3E24' }) +
    P('M-6.2-4.8A7.8 7.8 0 0 1 .6-7.8', { fill: 'none', stroke: '#fff', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '.55' });
}

/* ---------- morango cortado ao meio: casca vermelha, polpa clara e miolo branco ---------- */
function morango() {
  var d = 'M0 9.6C-7.8 5-9.6-2-7.4-6-5.8-8.8-2.4-9.2 0-8.2 2.4-9.2 5.8-8.8 7.4-6 9.6-2 7.8 5 0 9.6Z';
  var inn = 'M0 7.6C-5.8 4-7.2-1.6-5.6-4.8-4.4-7-2-7.2 0-6.4 2-7.2 4.4-7 5.6-4.8 7.2-1.6 5.8 4 0 7.6Z';
  return shadow(d, .8, 1.6, '#4A0A10', '.22') + P(d, { fill: 'url(#gMor)' }) + P(inn, { fill: 'url(#gMorIn)' }) +
    P('M0-5.6C-1.6-2-1.4 2.4 0 6 1.4 2.4 1.6-2 0-5.6Z', { fill: '#FFF3EE', opacity: '.9' }) +
    P('M-1.2-3L-4-4.4M-1.4 0L-4.8-.6M-1 3L-3.6 3.6M1.2-3L4-4.4M1.4 0L4.8-.6M1 3L3.6 3.6', { stroke: '#FFD9D2', 'stroke-width': '.5', 'stroke-linecap': 'round', opacity: '.8' }) +
    [[-6.6, -2], [-5.2, 3.2], [-2.6, 6.8], [6.6, -2], [5.2, 3.2], [2.6, 6.8], [-6, -5.6], [6, -5.6]].map(function (p) { return E(p[0], p[1], .45, .3, { fill: '#FFE7A0' }); }).join('') +
    P('M-3-7.6Q0-9.4 3-7.6L1.4-6.4Q0-7.4-1.4-6.4Z', { fill: '#4E9A36' });
}

/* ---------- coco ralado: fitinhas brancas curvas ---------- */
function coco(seed) {
  var r = rng(seed), out = '';
  for (var i = 0; i < 3; i++) { var a = r() * 6.28, x = (r() - .5) * 3, y = (r() - .5) * 3, c = Math.cos(a), s = Math.sin(a), L = 2.6 + r() * 1.4, d = 'M' + n(x - c * L) + ' ' + n(y - s * L) + 'Q' + n(x - s * 1.6) + ' ' + n(y + c * 1.6) + ' ' + n(x + c * L) + ' ' + n(y + s * L);
    out += P(d, { fill: 'none', stroke: '#3A1E0A', 'stroke-width': '1.4', 'stroke-linecap': 'round', opacity: '.3', transform: 'translate(.3 .6)' }) + P(d, { fill: 'none', stroke: i % 2 ? '#FFFDF6' : '#F6EEDC', 'stroke-width': '1.2', 'stroke-linecap': 'round' }); }
  return out;
}

/* ---------- goiabada: cubo brilhante vinho com quina iluminada ---------- */
function goiabada() {
  return '<rect x="-4.4" y="-4" width="10.4" height="10.4" rx="2.4" fill="#3A0A10" opacity=".25"/><rect x="-5.2" y="-5.2" width="10.4" height="10.4" rx="2.4" fill="url(#gGoi)"/>' +
    P('M-5.2-2.8V-2.8A2.4 2.4 0 0 1-2.8-5.2H2.8A2.4 2.4 0 0 1 5.2-2.8', { fill: 'none', stroke: '#E25A70', 'stroke-width': '.9', opacity: '.7' }) +
    '<rect x="-3.4" y="-3.6" width="4" height="1.6" rx=".8" fill="#FFB0BC" opacity=".65"/>' + Ci(2.6, 2.4, .5, { fill: '#F07D8E', opacity: '.4' });
}

/* ---------- ervilha: grão verde brilhante ---------- */
function ervilha(v) {
  return Ci(.5, .8, 4.4, { fill: '#1A2E0C', opacity: '.28' }) + Ci(0, 0, 4.3, { fill: v ? '#6DB43A' : '#5AA330' }) +
    E(-1.2, -1.4, 1.7, 1, { fill: '#D4F08A', opacity: '.85' }, -30) + Ci(1.5, 1.2, .7, { fill: '#3E7A1C', opacity: '.45' }) +
    P('M-1.6-3.2Q0-4.2 1.6-3', { fill: 'none', stroke: '#8FCB5A', 'stroke-width': '.7', 'stroke-linecap': 'round' });
}
/* ---------- palmito: rodela pálida com anéis ---------- */
function palmito(v) {
  var d = v ? blob(0, 0, 8.6, 7.4, 9, .12, rng(3)) : blob(0, 0, 8.2, 8, 10, .1, rng(8));
  return shadow(d, .7, 1.2, '#6A5A30', '.2') + P(d, { fill: '#F3E6C4', stroke: '#D2BE8A', 'stroke-width': '.7' }) +
    Ci(0, 0, 4.6, { fill: 'none', stroke: '#E8D7A8', 'stroke-width': '1.2' }) +
    Ci(0, 0, 2.4, { fill: '#FFF8E8', stroke: '#E0CC96', 'stroke-width': '.6' }) +
    E(-2.4, -2.6, 2, .8, { fill: '#fff', opacity: '.65' }, -30);
}

/* ---------- confete, granulado, amendoim, pistache, raspas, caramelo, azeite ---------- */
var SIMPLE = {
  confete: '<circle cx=".5" cy=".8" r="3.9" fill="#000" opacity=".22"/><circle r="3.9"/><circle r="3.9" fill="none" stroke="#000" stroke-width=".6" opacity=".18"/><ellipse cx="-1.2" cy="-1.4" rx="1.6" ry=".9" fill="#fff" opacity=".55" transform="rotate(-30 -1.2 -1.4)"/>',
  granulado: '<rect x="-3.3" y="-.5" width="7.4" height="2.4" rx="1.2" fill="#1A0C05" opacity=".3"/><rect x="-3.6" y="-1.2" width="7.4" height="2.4" rx="1.2" fill="#4A2412"/><rect x="-2.8" y="-1" width="4.2" height=".8" rx=".4" fill="#C98958"/><rect x="1.2" y="-.2" width="1.6" height=".5" rx=".2" fill="#2A1208" opacity=".5"/>',
  amendoim: '<ellipse cx=".5" cy=".9" rx="4.8" ry="3.4" fill="#3A1E0A" opacity=".3"/><path d="M-4.4.2c0-2.4 2-3.4 4.4-3.4s4.4 1 4.4 3.2-2 3.2-4.4 3.2S-4.4 2.6-4.4.2z" fill="#E0AE68"/><path d="M-4.4.2c0 2.4 2 3 4.4 3s4.4-1 4.4-3" fill="#B0743A"/><path d="M-3.8-1.4c.6-1 1.6-1.6 2.6-1.6" stroke="#8A4A22" stroke-width=".9" stroke-linecap="round" fill="none" opacity=".7"/><ellipse cx="-.4" cy="-1" rx="1.9" ry=".8" fill="#F8DDAE"/><path d="M3.2-.8l.8.8" stroke="#8A5A2A" stroke-width=".6" stroke-linecap="round"/>',
  pistache: '<ellipse cx=".6" cy="1" rx="4.6" ry="3.2" fill="#2E3A12" opacity=".25"/><path d="M-4.2-1.4l3.8-2.6 4.2 1.4.6 3.4-3.8 2.4-4.4-1z" fill="#8DB84C"/><path d="M-4.2-1.4l3.8-2.6 4.2 1.4" stroke="#7A4652" stroke-width="1.2" fill="none" stroke-linejoin="round" opacity=".85"/><path d="M-1.6-.4l2.8-.7" stroke="#DCEEAA" stroke-width="1" stroke-linecap="round"/><circle cx="1.6" cy="1.4" r=".7" fill="#B8D670"/>',
  raspa: '<path d="M-5.6 1.6c1.6-4 9.8-4.6 11.4-.6-1.8 2.8-9.4 3.4-11.4.6z" fill="#6E4E26" opacity=".22" transform="translate(.8 1.4)"/><path d="M-5.6 1.2c1.6-4 9.8-4.6 11.4-.6-1.8 2.8-9.4 3.4-11.4.6z" fill="#FFFDF7" stroke="#DCC29A" stroke-width=".7"/><path d="M-3.8-.6c1.8-1.6 5.6-1.8 7.6-.4" stroke="#E6D2B0" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M-3.4-1.6c1.4-.9 3.6-1 5-.4" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>',
  caramelo: '<ellipse rx="9" ry="6" fill="#DDA35A" opacity=".55"/><ellipse rx="5" ry="3" fill="#B97A36" opacity=".45"/>',
  azeite: '<ellipse rx="6" ry="3.6" fill="#D2A62E" opacity=".42"/><ellipse cx=".4" cy=".2" rx="4.2" ry="2.3" fill="#F0CF55" opacity=".55"/><ellipse cx="-1.9" cy="-1.1" rx="1.8" ry=".8" fill="#fff" opacity=".75"/>'
};

/* SPR[id] = desenho (string) ou lista de variações */
export const SPR = Object.assign({
  frango: [frango(11), frango(23), frango(37), frango(52)],
  catupiry: [catupiry(5), catupiry(17), catupiry(29)],
  calabresa: [calabresa(3), calabresa(8), calabresa(14)],
  bacon: [bacon(4), bacon(9), bacon(21)],
  ovo: [ovo(false), ovo(true)],
  tomate: [tomate(2), tomate(6), tomate(12)],
  cebola: [cebola(0), cebola(1), cebola(2)],
  azeitona: [azeitona(0), azeitona(1)],
  pimentao: [pimentao(3, false), pimentao(7, true), pimentao(13, true)],
  milho: [milho(0), milho(1)],
  lombo: [lombo(4), lombo(10)],
  abacaxi: [abacaxi(0), abacaxi(1)],
  geleia: [geleia(3), geleia(9)],
  champignon: [champignon(0), champignon(1)],
  alho: [alho(0), alho(1)],
  presunto: [presunto(5), presunto(12), presunto(19)],
  manjericao: [manjericao(0), manjericao(1)],
  parmesao: [parmesao(4), parmesao(15)],
  provolone: [provolone(2), provolone(8)],
  gorgonzola: [gorgonzola(3), gorgonzola(11)],
  banana: banana(),
  morango: morango(),
  coco: [coco(2), coco(7), coco(13)],
  goiabada: goiabada(),
  ervilha: [ervilha(0), ervilha(1)],
  palmito: [palmito(0), palmito(1)]
}, SIMPLE);
