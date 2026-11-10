/* components/Menu/menu.client.js — lógica do cliente (vanilla JS, ES module) */
import { pick } from '../Builder/builder.client.js';
import { menuItemHTML } from './menu-markup.js';
import { C } from '../../lib/catalog.js';
import { $, $$, reduce, shot } from '../../lib/utils.js';

export let tab, all, tabs, pb, tsent;

export function renderMenu(){var items=C[tab],list=all?items:items.slice(0,8),ml=$('#mlist');
  ml.innerHTML=list.map(menuItemHTML).join('');
  $('#moreBtn').textContent=all?'Mostrar menos':'Ver todos os '+items.length+' sabores';
  $$('.mi',ml).forEach(function(li,i){li.onclick=function(){pick(li.dataset.n,'menu_item')};
    if(!reduce)li.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:600,delay:i*35,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})})}

export function movePill(){var b=$('.on',tabs);pb.style.width=b.offsetWidth+'px';pb.style.transform='translateX('+(b.offsetLeft-4)+'px)'}

export function init(){
/* ================= CARDÁPIO ================= */
 tab='salgadas',all=shot;
 tabs=$('#tabs'),pb=$('.pillbg',tabs);
$$('button',tabs).forEach(function(b){b.onclick=function(){$$('button',tabs).forEach(function(x){x.classList.remove('on')});b.classList.add('on');tab=b.dataset.t;all=false;movePill();renderMenu();
  if(tabs.classList.contains('stuck'))scrollTo({top:tabs.parentNode.getBoundingClientRect().top+scrollY+tabs.offsetTop-(innerWidth<900?72:84)-8,behavior:reduce?'auto':'smooth'})}});
if('IntersectionObserver' in window){ tsent=document.createElement('div');tsent.style.height='1px';tabs.parentNode.insertBefore(tsent,tabs);
  new IntersectionObserver(function(es){var e=es[0];tabs.classList.toggle('stuck',!e.isIntersecting&&e.boundingClientRect.top<0)},{rootMargin:'-'+(innerWidth<900?73:85)+'px 0px 0px 0px'}).observe(tsent)}
$('#moreBtn').onclick=function(){all=!all;renderMenu()};
renderMenu();
requestAnimationFrame(movePill);
}
