/* components/Reviews/reviews.client.js — lógica do cliente (vanilla JS, ES module) */
import { reviewDotHTML, reviewHTML } from './review-markup.js';
import { REVIEWS } from '../../data/index.js';
import { $, $$, reduce, shot } from '../../lib/utils.js';

export let rv, dots, ri, pause;

export function goRev(i){ri=(i+REVIEWS.length)%REVIEWS.length;var c=rv.children[ri];rv.scrollTo({left:c.offsetLeft-rv.offsetLeft-(rv.clientWidth-c.clientWidth)/2,behavior:reduce?'auto':'smooth'})}

export function inView(e){var r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}

export function init(){
/* ================= 4) AVALIAÇÕES ================= */
 rv=$('#revTrack');
rv.innerHTML=REVIEWS.map(reviewHTML).join('');
 dots=$('#revDots');
dots.innerHTML=REVIEWS.map(reviewDotHTML).join('');
 ri=0,pause=0;
rv.addEventListener('scroll',function(){var m=rv.scrollLeft+rv.clientWidth/2,best=0,bd=1e9;$$('.rev',rv).forEach(function(c,i){var d=Math.abs(c.offsetLeft-rv.offsetLeft+c.clientWidth/2-m);if(d<bd){bd=d;best=i}});ri=best;$$('button',dots).forEach(function(b,i){b.classList.toggle('on',i===best)})},{passive:true});
$$('button',dots).forEach(function(b,i){b.onclick=function(){pause=Date.now();goRev(i)}});
['pointerdown','touchstart','wheel'].forEach(function(ev){rv.addEventListener(ev,function(){pause=Date.now()},{passive:true})});
$$('button',dots)[0].classList.add('on');
if(!reduce&&!shot)setInterval(function(){if(Date.now()-pause>8000&&inView(rv))goRev(ri+1)},4200);
}
