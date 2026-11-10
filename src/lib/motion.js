/* lib/motion.js — lógica do cliente (vanilla JS, ES module) */
import { $$, reduce, shot } from './utils.js';

export let pio, io;

export function init(){
/* pausa animações infinitas fora da tela (bateria/CPU) */
if('IntersectionObserver' in window){ pio=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('off',!e.isIntersecting);var sv=e.target.querySelector('svg.oven');if(sv&&sv.pauseAnimations){if(e.isIntersecting)sv.unpauseAnimations();else sv.pauseAnimations()}})},{rootMargin:'120px'});
  $$('.hero,.ribbon,.reels,.oven-band,.lanc,.final').forEach(function(n){pio.observe(n)})}
}

export function init2(){
 io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);
  var c=e.target.querySelector('[data-count]');if(c&&!reduce){var to=+c.dataset.count,t0=performance.now();(function f(n){var k=Math.min(1,(n-t0)/1600);c.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)}
  $$('[data-count]',e.target).slice(1).forEach(function(c2){if(reduce)return;var to=+c2.dataset.count,t0=performance.now();(function f(n){var k=Math.min(1,(n-t0)/1600);c2.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)})}})},{rootMargin:'0px 0px -10% 0px'});
$$('.rv,.rv-clip').forEach(function(e){if(shot||reduce)e.classList.add('in');else io.observe(e)});
}
