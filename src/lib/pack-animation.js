/* Animação ao adicionar: a pizza é fatiada em 8, desliza para a caixa Bruno's Pizza e a tampa fecha.
   ~2,7 s. Respeita prefers-reduced-motion. Não bloqueia o montador (usa um clone numa overlay). */
const NS = 'http://www.w3.org/2000/svg';

function el(t, a, p) {
  var e = document.createElementNS(NS, t);
  for (var k in a) if (a[k] != null) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
}

function anim(node, kf, o) {
  if (!node.animate) {
    var l = kf[kf.length - 1];
    for (var k in l) if (k !== 'offset' && k !== 'easing') node.style[k] = l[k];
    return { finished: Promise.resolve(), cancel: function () {} };
  }
  return node.animate(kf, Object.assign({ fill: 'both' }, o));
}

function clonePizzaSvg(sourceSvg) {
  var c = sourceSvg.cloneNode(true);
  c.removeAttribute('id');
  c.removeAttribute('style');
  c.removeAttribute('class');
  c.removeAttribute('role');
  c.removeAttribute('aria-label');
  c.setAttribute('viewBox', sourceSvg.getAttribute('viewBox') || '-10 -10 420 420');
  c.setAttribute('width', '420');
  c.setAttribute('height', '420');
  c.setAttribute('x', '-10');
  c.setAttribute('y', '-10');
  c.setAttribute('overflow', 'visible');
  return c;
}


function freezeClone(svg) {
  [].forEach.call(svg.querySelectorAll('animate'), function (n) {
    var par = n.parentNode;
    if (n.getAttribute('attributeName') === 'd' && n.getAttribute('to')) par.setAttribute('d', n.getAttribute('to'));
    if (par) par.removeChild(n);
  });
  [].forEach.call(svg.querySelectorAll('g[data-part]'), function (g) {
    if (g.style.display === 'none') return;
    g.style.opacity = '1';
    g.style.display = '';
    [].forEach.call(g.querySelectorAll('*'), function (el) {
      var o = el.getAttribute('data-o');
      if (o != null) { el.setAttribute('opacity', o); el.style.opacity = o; }
      else if (el.getAttribute('opacity') === '0') { el.setAttribute('opacity', '1'); el.style.opacity = '1'; }
      el.style.transform = 'none';
      if (el.tagName && (el.tagName.toLowerCase() === 'path' || el.tagName.toLowerCase() === 'circle' || el.tagName.toLowerCase() === 'line')) {
        el.style.strokeDashoffset = '0';
        if (el.hasAttribute('stroke-dashoffset')) el.setAttribute('stroke-dashoffset', '0');
      }
    });
  });
  [].forEach.call(svg.querySelectorAll('.steam, g.steam'), function (s) { if (s.parentNode) s.parentNode.removeChild(s); });
}

function boxBaseMarkup(uid) {
  return (
    '<g class="pack-box-base">' +
      '<path d="M70 248 L330 248 L355 300 L45 300 Z" fill="#C4A06A"/>' +
      '<path d="M45 300 L355 300 L348 314 L52 314 Z" fill="#A57C48"/>' +
      '<path d="M88 256 L312 256 L330 292 L70 292 Z" fill="#F7F1E6"/>' +
      '<path d="M88 256 L312 256 L318 266 L82 266 Z" fill="#EFE6D6"/>' +
      '<g opacity=".28" clip-path="url(#' + uid + 'Bed)">' +
        '<path d="M88 256 L312 256 L330 292 L70 292 Z" fill="#E7C9A0"/>' +
      '</g>' +
    '</g>'
  );
}
function boxLidMarkup() {
  return (
    '<g class="pack-box-lidwrap" transform="translate(200 256)">' +
      '<g class="box-lid">' +
        '<g transform="translate(-200 -256)">' +
          '<path d="M78 36 L322 36 L330 256 L70 256 Z" fill="#FBF7F0" stroke="#E5D9C6" stroke-width="1.2"/>' +
          '<path d="M78 36 L322 36 L318 50 L82 50 Z" fill="#C49A62"/>' +
          '<g transform="translate(200 128) scale(0.108) translate(-540 -640)" fill="#C41E2A">' +
            '<use href="#logo" width="1080" height="1368"/>' +
          '</g>' +
          '<text x="200" y="222" text-anchor="middle" fill="#C41E2A" font-family="ui-serif, Georgia, serif" font-size="9" font-weight="600">@pizzasdobruno  ·  (22) 98104-8508</text>' +
        '</g>' +
      '</g>' +
    '</g>'
  );
}

/**
 * @param {SVGElement} sourceSvg pizza atual
 * @returns {Promise<void>}
 */
export function playPackAnimation(sourceSvg) {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !sourceSvg) return Promise.resolve();

  var uid = 'pk' + Math.random().toString(36).slice(2, 9);
  var stage = document.createElement('div');
  stage.className = 'pack-stage';
  stage.setAttribute('aria-hidden', 'true');
  var card = document.createElement('div');
  card.className = 'pack-card';
  var svg = el('svg', { class: 'pack-svg', viewBox: '0 0 400 360', role: 'img' }, card);
  svg.innerHTML =
    '<defs>' +
      '<clipPath id="' + uid + 'Bed"><path d="M88 256 L312 256 L330 292 L70 292 Z"/></clipPath>' +
    '</defs>';
  stage.appendChild(card);
  document.body.appendChild(stage);

  var pizza = el('g', { class: 'pack-pizza' }, svg);
  pizza.setAttribute('transform', 'translate(200 132) scale(0.52) translate(-200 -200)');

  var slices = el('g', { class: 'pack-slices' }, pizza);
  var i;
  for (i = 0; i < 8; i++) {
    var a0 = -Math.PI / 2 + i * Math.PI / 4;
    var a1 = a0 + Math.PI / 4;
    var midA = (a0 + a1) / 2;
    var id = uid + 'W' + i;
    var d =
      'M200 200 L' +
      (200 + 210 * Math.cos(a0)).toFixed(1) + ' ' + (200 + 210 * Math.sin(a0)).toFixed(1) +
      ' A210 210 0 0 1 ' +
      (200 + 210 * Math.cos(a1)).toFixed(1) + ' ' + (200 + 210 * Math.sin(a1)).toFixed(1) +
      ' Z';
    var cp = el('clipPath', { id: id }, svg.querySelector('defs'));
    el('path', { d: d }, cp);
    var g = el('g', { 'clip-path': 'url(#' + id + ')', 'data-mid': String(midA) }, slices);
    var c=clonePizzaSvg(sourceSvg);freezeClone(c);g.appendChild(c);
  }

  var lines = el('g', { fill: 'none', stroke: '#FBF7F0', 'stroke-width': '4', 'stroke-linecap': 'round', opacity: '0' }, pizza);
  for (i = 0; i < 4; i++) {
    var ang = -Math.PI / 2 + i * Math.PI / 4;
    el('line', {
      x1: (200 + 12 * Math.cos(ang)).toFixed(1),
      y1: (200 + 12 * Math.sin(ang)).toFixed(1),
      x2: (200 + 184 * Math.cos(ang)).toFixed(1),
      y2: (200 + 184 * Math.sin(ang)).toFixed(1)
    }, lines);
    el('line', {
      x1: (200 - 12 * Math.cos(ang)).toFixed(1),
      y1: (200 - 12 * Math.sin(ang)).toFixed(1),
      x2: (200 - 184 * Math.cos(ang)).toFixed(1),
      y2: (200 - 184 * Math.sin(ang)).toFixed(1)
    }, lines);
  }

  var boxBase = el('g', { class: 'pack-box-wrap', opacity: '0' }, null);
  boxBase.innerHTML = boxBaseMarkup(uid);
  svg.insertBefore(boxBase, pizza); /* base da caixa atrás da pizza */
  var boxLid = el('g', { class: 'pack-lid-wrap', opacity: '0' }, svg);
  boxLid.innerHTML = boxLidMarkup();
  var lid = boxLid.querySelector('.box-lid');
  if (lid) lid.style.transform = 'rotate(-118deg)';

  var sliceNodes = [].slice.call(slices.children);
  var running = [];
  function go(node, kf, o) { running.push(anim(node, kf, o)); }

  go(lines, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
  sliceNodes.forEach(function (g) {
    var midA = +g.getAttribute('data-mid');
    var dx = Math.cos(midA) * 16;
    var dy = Math.sin(midA) * 16;
    go(g, [
      { transform: 'translate(0px, 0px)' },
      { transform: 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px)' }
    ], { duration: 420, delay: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
  go(boxBase, [{ opacity: 0, transform: 'translateY(18px) scale(.96)' }, { opacity: 1, transform: 'none' }], {
    duration: 420, delay: 650, easing: 'cubic-bezier(.22,1,.36,1)'
  });
  go(boxLid, [{ opacity: 0 }, { opacity: 1 }], {
    duration: 420, delay: 650, easing: 'cubic-bezier(.22,1,.36,1)'
  });
  sliceNodes.forEach(function (g) {
    go(g, [
      { transform: 'translate(' + (Math.cos(+g.getAttribute('data-mid')) * 16).toFixed(1) + 'px, ' + (Math.sin(+g.getAttribute('data-mid')) * 16).toFixed(1) + 'px)' },
      { transform: 'translate(0px, 0px)' }
    ], { duration: 500, delay: 1100, easing: 'cubic-bezier(.45,0,.2,1)' });
  });
  go(pizza, [
    { transform: 'translate(200px, 132px) scale(0.52) translate(-200px, -200px)' },
    { transform: 'translate(200px, 268px) scale(0.28) translate(-200px, -200px)' }
  ], { duration: 800, delay: 1150, easing: 'cubic-bezier(.45,0,.15,1)' });
  go(lines, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, delay: 1250, easing: 'ease' });
  if (lid) {
    go(lid, [
      { transform: 'rotate(-118deg)' },
      { transform: 'rotate(-8deg)', offset: 0.78 },
      { transform: 'rotate(0deg)' }
    ], { duration: 720, delay: 1750, easing: 'cubic-bezier(.4,0,.2,1.08)' });
  }
  go(stage, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, delay: 2550, easing: 'ease' });

  return new Promise(function (resolve) {
    setTimeout(function () {
      running.forEach(function (a) { try { a.cancel && a.cancel(); } catch (e) {} });
      if (stage.parentNode) stage.parentNode.removeChild(stage);
      resolve();
    }, 2950);
  });
}

export default playPackAnimation;
