/* Estado da caixa no montador:
   Depois de montar, a pizza é cortada em 8 (linhas visíveis, fatias NÃO se afastam),
   desliza para uma caixa Bruno's Pizza ABERTA (no lugar da pizza) e fica lá com vapor.
   Em “+ Adicionar ao pedido” a tampa fecha em 3D (logo por fora).
   Se o sabor/ingrediente/borda/meio a meio muda, a pizza sai da caixa, atualiza e pode voltar.
   Respeita prefers-reduced-motion. */
const NS = 'http://www.w3.org/2000/svg';

function reduced() {
  return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function el(t, a, p) {
  var e = document.createElementNS(NS, t);
  for (var k in a) if (a[k] != null) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
}
function anim(node, kf, o) {
  if (!node || !node.animate) {
    return { finished: Promise.resolve(), cancel: function () {} };
  }
  if (reduced()) {
    var l = kf[kf.length - 1];
    for (var k in l) if (k !== 'offset' && k !== 'easing') {
      try { node.style[k] = l[k]; } catch (e) {}
    }
    return { finished: Promise.resolve(), cancel: function () {} };
  }
  return node.animate(kf, Object.assign({ fill: 'both' }, o));
}

function lidMarkup() {
  var outside =
    '<svg class="box-lid-svg" viewBox="0 0 400 400" aria-hidden="true">' +
      '<rect x="2" y="2" width="396" height="396" rx="8" fill="#C4A06A"/>' +
      '<rect x="14" y="14" width="372" height="372" rx="4" fill="#FBF7F0"/>' +
      '<rect x="14" y="14" width="372" height="22" fill="#D4B07A"/>' +
      '<g transform="translate(200 188) scale(0.22) translate(-540 -640)" fill="#C41E2A" style="color:#C41E2A">' +
        '<use href="#logo" width="1080" height="1368" fill="#C41E2A"/>' +
      '</g>' +
      '<text x="200" y="348" text-anchor="middle" fill="#C41E2A" font-family="ui-serif, Georgia, serif" font-size="13" font-weight="600">@pizzasdobruno  ·  (22) 98104-8508</text>' +
    '</svg>';
  var inside =
    '<svg class="box-lid-svg" viewBox="0 0 400 400" aria-hidden="true">' +
      '<rect x="2" y="2" width="396" height="396" rx="8" fill="#B8894E"/>' +
      '<rect x="16" y="16" width="368" height="368" rx="4" fill="#F3E9D6"/>' +
      '<rect x="28" y="28" width="344" height="344" rx="2" fill="#EFE4D0" stroke="#E0D0B4" stroke-width="1"/>' +
    '</svg>';
  return (
    '<div class="box-lid-face box-lid-out">' + outside + '</div>' +
    '<div class="box-lid-face box-lid-in">' + inside + '</div>'
  );
}

function baseMarkup() {
  return (
    '<svg class="box-base-svg" viewBox="0 0 400 400" aria-hidden="true">' +
      '<rect x="0" y="0" width="400" height="400" rx="8" fill="#C4A06A"/>' +
      '<rect x="18" y="18" width="364" height="364" rx="4" fill="#F3E9D6"/>' +
      '<path d="M18 18 L382 18 L368 34 L32 34 Z" fill="#E5D4B3"/>' +
      '<path d="M18 18 L32 34 L32 368 L18 382 Z" fill="#B88A4E"/>' +
      '<path d="M382 18 L382 382 L368 368 L368 34 Z" fill="#B88A4E"/>' +
      '<path d="M18 382 L382 382 L368 368 L32 368 Z" fill="#A57C48"/>' +
    '</svg>'
  );
}

function steamMarkup() {
  return (
    '<span></span><span></span><span></span><span></span>'
  );
}

var state = 'idle'; // idle | presenting | open | sliding-out | closing
var scene = null;
var presentTimer = 0;
var waiters = [];

function wrap() { return document.getElementById('vizWrap'); }
function pizzaHost() { return document.getElementById('pizzaViz'); }
function pizzaSvg() {
  var h = pizzaHost();
  return h && h.querySelector('svg');
}

function ensureScene() {
  var w = wrap();
  if (!w) return null;
  scene = w.querySelector('.box-scene');
  if (scene) return scene;
  scene = document.createElement('div');
  scene.className = 'box-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML =
    '<div class="box-back"><div class="box-base">' + baseMarkup() + '</div></div>' +
    '<div class="box-front">' +
      '<div class="box-lid-hinge"><div class="box-lid">' + lidMarkup() + '</div></div>' +
      '<div class="box-steam">' + steamMarkup() + '</div>' +
    '</div>';
  w.appendChild(scene);
  return scene;
}

function ensureCuts(svg) {
  if (!svg) return null;
  var g = svg.querySelector('.pack-cuts');
  if (g) return g;
  g = el('g', {
    class: 'pack-cuts',
    fill: 'none',
    stroke: '#8B5A2B',
    'stroke-width': '2',
    'stroke-linecap': 'butt',
    opacity: '0',
    'pointer-events': 'none'
  }, svg);
  var i, ang;
  for (i = 0; i < 4; i++) {
    ang = -Math.PI / 2 + i * Math.PI / 4;
    el('line', {
      x1: (200 + 14 * Math.cos(ang)).toFixed(1),
      y1: (200 + 14 * Math.sin(ang)).toFixed(1),
      x2: (200 + 168 * Math.cos(ang)).toFixed(1),
      y2: (200 + 168 * Math.sin(ang)).toFixed(1)
    }, g);
    el('line', {
      x1: (200 - 14 * Math.cos(ang)).toFixed(1),
      y1: (200 - 14 * Math.sin(ang)).toFixed(1),
      x2: (200 - 168 * Math.cos(ang)).toFixed(1),
      y2: (200 - 168 * Math.sin(ang)).toFixed(1)
    }, g);
  }
  return g;
}

function clearCuts() {
  var svg = pizzaSvg();
  if (!svg) return;
  var g = svg.querySelector('.pack-cuts');
  if (g && g.parentNode) g.parentNode.removeChild(g);
}

function showLidSide(side) {
  var sc = scene || (wrap() && wrap().querySelector('.box-scene'));
  var lid = sc && sc.querySelector('.box-lid');
  if (!lid) return;
  if (side === 'out') lid.classList.add('show-out');
  else lid.classList.remove('show-out');
}

function hasPizza() {
  var st = window.__pizzaBoxHasPizza;
  if (typeof st === 'function') return st();
  var h = pizzaHost();
  return !!(h && h.querySelector('g[data-part]'));
}

function flushWaiters() {
  var w = waiters.splice(0);
  w.forEach(function (fn) { try { fn(); } catch (e) {} });
}

function presentNow() {
  if (state === 'open') return Promise.resolve();
  if (state === 'presenting') {
    return new Promise(function (r) { waiters.push(r); });
  }
  if (!hasPizza()) { state = 'idle'; teardown(true); return Promise.resolve(); }
  var sc = ensureScene();
  var svg = pizzaSvg();
  var host = pizzaHost();
  if (!sc || !svg || !host) return Promise.resolve();
  state = 'presenting';
  var cuts = ensureCuts(svg);
  var base = sc.querySelector('.box-base');
  var lid = sc.querySelector('.box-lid');
  var steam = sc.querySelector('.box-steam');
  var w = wrap();
  if (w) w.classList.add('has-box');
  sc.classList.add('on');
  sc.classList.remove('closed', 'out');
  if (lid) { lid.classList.remove('closed', 'show-out'); }
  showLidSide('in');
  if (steam) steam.classList.add('on');

  var skip = reduced();
  if (skip) {
    if (cuts) cuts.setAttribute('opacity', '1');
    if (host) host.classList.add('in-box');
    if (base) base.classList.add('in');
    state = 'open';
    flushWaiters();
    return Promise.resolve();
  }

  if (cuts) {
    [].forEach.call(cuts.querySelectorAll('line'), function (ln, i) {
      var len = Math.hypot(+ln.getAttribute('x2') - +ln.getAttribute('x1'), +ln.getAttribute('y2') - +ln.getAttribute('y1'));
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      anim(ln, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 420, delay: i * 40, easing: 'cubic-bezier(.45,0,.2,1)' });
    });
    anim(cuts, [{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
  }
  if (base) {
    base.classList.add('in');
    anim(base, [{ opacity: 0, transform: 'translateY(28px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  if (host) {
    host.classList.add('in-box');
    anim(host, [{ transform: 'none' }, { transform: 'translateY(12%) scale(0.64)' }], { duration: 560, delay: 420, easing: 'cubic-bezier(.45,0,.15,1)' });
  }
  var lidEl = sc.querySelector('.box-lid');
  if (lidEl) {
    anim(lidEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 400, easing: 'ease-out' });
  }

  return new Promise(function (resolve) {
    setTimeout(function () {
      if (state === 'presenting') { state = 'open'; flushWaiters(); }
      resolve();
    }, skip ? 0 : 1100);
  });
}

function teardown(instant) {
  var sc = scene || (wrap() && wrap().querySelector('.box-scene'));
  var host = pizzaHost();
  var w = wrap();
  if (host) host.classList.remove('in-box');
  if (host) host.style.transform = '';
  if (w) w.classList.remove('has-box');
  clearCuts();
  if (sc) {
    sc.classList.remove('on', 'closed', 'out');
    sc.style.opacity = '';
    if (instant && sc.parentNode) sc.parentNode.removeChild(sc);
    else if (sc.parentNode) {
      setTimeout(function () { if (state === 'idle' && sc.parentNode) sc.parentNode.removeChild(sc); }, 400);
    }
  }
  scene = null;
}

export function isOpen() { return state === 'open' || state === 'presenting' || state === 'closing'; }
export function isBusy() { return state === 'presenting' || state === 'sliding-out' || state === 'closing' || state === 'open'; }

export function present() {
  if (presentTimer) clearTimeout(presentTimer);
  if (state === 'sliding-out' || state === 'closing') return Promise.resolve();
  if (state === 'open' || state === 'presenting') return Promise.resolve();
  if (!hasPizza()) { state = 'idle'; return Promise.resolve(); }
  return presentNow();
}

export function schedulePresent(delay) {
  if (presentTimer) clearTimeout(presentTimer);
  presentTimer = setTimeout(function () { presentTimer = 0; present(); }, delay == null ? (reduced() ? 40 : 120) : delay);
}

export function slideOut() {
  if (presentTimer) { clearTimeout(presentTimer); presentTimer = 0; }
  if (state === 'idle') return Promise.resolve();
  if (state === 'sliding-out') {
    return new Promise(function (r) { waiters.push(r); });
  }
  var sc = scene || (wrap() && wrap().querySelector('.box-scene'));
  var host = pizzaHost();
  var svg = pizzaSvg();
  var cuts = svg && svg.querySelector('.pack-cuts');
  state = 'sliding-out';
  if (sc) sc.classList.add('out');
  var skip = reduced();
  if (host) {
    anim(host, [{ transform: 'translateY(12%) scale(0.64)' }, { transform: 'none' }], { duration: skip ? 1 : 480, easing: 'cubic-bezier(.22,1,.36,1)' });
    host.classList.remove('in-box');
  }
  if (cuts) anim(cuts, [{ opacity: 1 }, { opacity: 0 }], { duration: skip ? 1 : 280, easing: 'ease' });
  if (sc) anim(sc, [{ opacity: 1 }, { opacity: 0 }], { duration: skip ? 1 : 360, delay: skip ? 0 : 80, easing: 'ease' });
  return new Promise(function (resolve) {
    setTimeout(function () {
      teardown(true);
      state = 'idle';
      flushWaiters();
      resolve();
    }, skip ? 40 : 520);
  });
}

export function closeLid() {
  if (state === 'closing') {
    return new Promise(function (r) { waiters.push(r); });
  }
  var start = (state === 'open')
    ? Promise.resolve()
    : (state === 'presenting')
      ? new Promise(function (r) { waiters.push(r); })
      : presentNow();
  return start.then(function () {
    if (!scene && !ensureScene()) return Promise.resolve();
    state = 'closing';
    var sc = scene;
    var lid = sc && sc.querySelector('.box-lid');
    var steam = sc && sc.querySelector('.box-steam');
    if (steam) steam.classList.remove('on');
    if (sc) sc.classList.add('closed');
    if (lid) lid.classList.add('closed');
    var skip = reduced();
    if (skip) {
      showLidSide('out');
    } else {
      if (lid) {
        anim(lid, [
          { transform: 'rotateX(-118deg)' },
          { transform: 'rotateX(-16deg)', offset: 0.82 },
          { transform: 'rotateX(0deg)' }
        ], { duration: 720, easing: 'cubic-bezier(.4,0,.2,1.08)' });
      }
      // troca a face perto de 90°, quando a tampa passa de ponta-cabeça
      setTimeout(function () { showLidSide('out'); }, 280);
    }
    return new Promise(function (resolve) {
      // segura a tampa fechada um pouco para o logo aparecer
      setTimeout(function () { flushWaiters(); resolve(); }, skip ? 80 : 1500);
    });
  });
}

export function reopen() {
  var sc = scene || (wrap() && wrap().querySelector('.box-scene'));
  var lid = sc && sc.querySelector('.box-lid');
  var steam = sc && sc.querySelector('.box-steam');
  if (!sc) { state = 'idle'; return present(); }
  if (lid) lid.classList.remove('closed');
  sc.classList.remove('closed');
  if (steam) steam.classList.add('on');
  var skip = reduced();
  if (skip) {
    showLidSide('in');
  } else if (lid) {
    anim(lid, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-118deg)' }], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' });
    setTimeout(function () { showLidSide('in'); }, 260);
  }
  state = 'open';
  return Promise.resolve();
}

/* compat: o botão de adicionar ainda importa playPackAnimation */
export function playPackAnimation() {
  return closeLid();
}

export const BoxStage = {
  present: present,
  schedulePresent: schedulePresent,
  slideOut: slideOut,
  closeLid: closeLid,
  reopen: reopen,
  isOpen: isOpen,
  isBusy: isBusy
};

export default playPackAnimation;
