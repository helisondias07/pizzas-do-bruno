/* components/BottomBar/bottom-bar.client.js — lógica do cliente (vanilla JS, ES module) */
import { S } from '../../lib/state.js';
import { openSheet } from '../CartSheet/cart-sheet.client.js';
import { info, totals } from '../../lib/cart-store.js';
import { $, COARSE, brl, reduce } from '../../lib/utils.js';

export let nav, sticky, hideBy, sio;

export function onS(){nav.classList.toggle('scrolled',scrollY>20);sticky.classList.toggle('show',scrollY>innerHeight*.7||cartN()>0)}

export function updHide(){sticky.classList.toggle('hide',Object.keys(hideBy).some(function(k){return hideBy[k]}))}

export function bumpCart(){var c=$('#stickyCta');if(!c||reduce)return;c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}

export function cartN(){return S.order?S.order.reduce(function(a,o){return a+o.qty},0)+S.coca:0}

export function updSticky(){var s=$('#stickyCta'),n=cartN(),t1=$('#sticky .t1');if(!s)return;
  if(n){var t=totals();s.dataset.cart='1';s.setAttribute('aria-label','Pedir: ver meu pedido, '+n+(n>1?' itens':' item'));s.setAttribute('aria-haspopup','dialog');
    t1.querySelector('b').textContent=brl(t.total)+(t.unk||(info.tipo==='entrega'&&(t.fee.unk||!info.bairro))?' + entrega':'')}
  else{s.dataset.cart='';s.setAttribute('aria-label','Pedir: montar meu pedido');s.removeAttribute('aria-haspopup');t1.querySelector('b').textContent='Bateu a fome?'}
  if(typeof onS==='function'&&window.__ready)onS()}

export function goBuilder(src){var m=$('#montar');if(!m)return;m.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});track('builder_cta_click',{source:src,nav:true})}

export function init(){
/* ================= Nav / sticky ================= */
 nav=$('#nav'),sticky=$('#sticky');
// barra fixa some sobre o botão de envio, no rodapé e com o teclado aberto (não cobre campos)
 hideBy={};
if('IntersectionObserver' in window){ sio=new IntersectionObserver(function(es){es.forEach(function(e){hideBy[e.target.id||e.target.tagName]=e.isIntersecting});updHide()});
  [$('#sendBtn'),$('.final'),$('footer')].forEach(function(n){if(n)sio.observe(n)})}
document.addEventListener('focusin',function(e){if(COARSE&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){hideBy.kb=true;updHide()}});
document.addEventListener('focusout',function(){hideBy.kb=false;updHide()});
}

export function init2(){
// com itens: abre o mini-carrinho (e o fluxo de endereço); vazio: leva ao montador
$('#stickyCta').addEventListener('click',function(e){e.preventDefault();if(this.dataset.cart==='1'){openSheet(this);return}
  goBuilder('sticky')});
}
