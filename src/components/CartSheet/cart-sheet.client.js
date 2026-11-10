/* components/CartSheet/cart-sheet.client.js — lógica do cliente (vanilla JS, ES module) */
import { S } from '../../lib/state.js';
import { cartN, hideBy, updHide } from '../BottomBar/bottom-bar.client.js';
import { setTipo } from '../DeliveryChoice/delivery-choice.client.js';
import { renderOrder } from '../OrderPanel/order-panel.client.js';
import { lastTxt, reorder } from '../Reorder/reorder.client.js';
import { doSend, formAddr, formErr, savedAddr } from '../../lib/address.js';
import { info, loadLast, pizzaPrice, sem, totals } from '../../lib/cart-store.js';
import { ST } from '../../lib/hours.js';
import { map } from '../../lib/location.js';
import { $, $$, CFG, brl, buzz, reduce } from '../../lib/utils.js';
import { semTxt } from '../../lib/whatsapp.js';

export let sheet, sbd, sheetOpen, lastFocus;

export function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

export function itemTitle(o){return o.mode==='meio'?'Pizza meio a meio':'Pizza '+o.a.nome}

export function itemDesc(o){var d=[];if(o.mode==='meio'){d.push('½ '+o.a.nome+sem(o.a,o.remA));d.push('½ '+o.b.nome+sem(o.b,o.remB))}else{var s=semTxt(o.a,o.remA);if(s)d.push(s)}if(o.borda)d.push('borda Catupiry');return d.join(' · ')}

export function qy(k,n,nm){return '<span class="qy"><button type="button" data-k="'+k+'" data-d="-1" aria-label="Diminuir '+nm+'">−</button><b aria-live="polite">'+n+'</b><button type="button" data-k="'+k+'" data-d="1" aria-label="Aumentar '+nm+'">+</button></span><button type="button" class="rm" data-k="'+k+'" data-d="x">Remover</button>'}

export function renderSheet(){var ul=$('#shList');if(!ul)return;var rows=S.order.map(function(o,i){var p=pizzaPrice(o),d=itemDesc(o).replace(/ (c\/|e|com|de) /g,' $1\u00a0'),nm=itemTitle(o);
    return '<li><span class="nm">'+nm+'</span><span class="pr">'+(p==null?'consulte':brl(p*o.qty))+'</span>'+(d?'<span class="ds">'+d+'</span>':'')+'<div class="ct">'+qy('p'+i,o.qty,nm)+'</div></li>'});
  if(S.coca)rows.push('<li><span class="nm">Coca-Cola 1,5 L</span><span class="pr">'+brl(S.coca*CFG.cocaPreco)+'</span><div class="ct">'+qy('c',S.coca,'Coca-Cola')+'</div></li>');
  ul.innerHTML=rows.join('');var empty=!S.order.length&&!S.coca;$('#shEmpty').hidden=!empty;$('#shCoca').hidden=empty||S.coca>0;
  var ld=empty&&loadLast(),em=$('#shEmpty p');em.innerHTML=ld?'Da última vez: '+esc(lastTxt(ld))+' <button type="button" class="btn btn-ink ag-go" data-again>Pedir de novo</button>':'Seu pedido está vazio. Comece por uma das mais pedidas:';
  $('#shDeliv').hidden=empty;
  var t=totals();$('#shTot').textContent=brl(t.total)+(t.unk?' +':'');
  $('#shNote').textContent=empty?'':info.tipo==='entrega'?(t.fee.unk||!info.bairro?'+ taxa de entrega (escolha o bairro ou o Bruno confirma no WhatsApp)':'Inclui entrega de '+brl(t.fee.v)):'Retirada no local, sem taxa';
  var sb=$('#shSend'),st=sb.querySelector('span.t');sb.classList.toggle('is-off',empty);sb.setAttribute('aria-disabled',empty?'true':'false');
  st.textContent=empty?'Adicione uma pizza':ST.open?'Pedir pelo WhatsApp':'Deixar pedido agendado';if(S.step==='form'&&!formErr())$('#formErr').textContent=''}

export function setStep(s){S.step=s;$('#vCart').hidden=s!=='cart';$('#vAsk').hidden=s!=='ask';$('#vForm').hidden=s!=='form';$('#vConfirm').hidden=s!=='confirm';$('#shBack').hidden=s==='cart';sheet.classList.toggle('step-ask',s==='ask');sheet.classList.toggle('step-confirm',s==='confirm');
  $('#sheetTtl').textContent=s==='cart'?'Seu pedido':s==='ask'?'Você já é nosso cliente?':s==='confirm'?'Seu endereço':'Primeiro pedido';if(s==='ask'){var sv=savedAddr();$('#askYesSub').textContent=sv?'Usar o endereço salvo neste celular':'O Bruno já tem meu endereço'}$('#shBody').scrollTop=0;renderSheet();
  if(s==='form'&&map)setTimeout(function(){map.invalidateSize()},80);if(sheetOpen)sheet.focus({preventScroll:true});track('checkout_step',{step:s})}

export function openSheet(from,s){if(sheetOpen){if(s)setStep(s);return}sheetOpen=true;lastFocus=from||document.activeElement;setStep(s||'cart');sheet.hidden=false;sbd.hidden=false;sheet.style.transform='';
  void sheet.offsetWidth;sheet.classList.add('on');sbd.classList.add('on');document.documentElement.classList.add('sheet-open');hideBy.sheet=true;updHide();
  setTimeout(function(){sheet.focus({preventScroll:true})},reduce?0:80);track('cart_open',{items:cartN()})}

export function closeSheet(cb){if(!sheetOpen)return;sheetOpen=false;sheet.classList.remove('on','drag');sheet.style.transform='';sbd.classList.remove('on');sbd.style.opacity='';
  document.documentElement.classList.remove('sheet-open');hideBy.sheet=false;updHide();
  setTimeout(function(){if(!sheetOpen){sheet.hidden=true;sbd.hidden=true}if(cb)cb()},reduce?0:380);
  if(!cb&&lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus({preventScroll:true})}

export function init(){
/* ================= MINI-CART (bottom sheet / painel) ================= */
 sheet=$('#sheet'),sbd=$('#sheetBd'),sheetOpen=false,lastFocus=null;
$('#shList').addEventListener('click',function(e){var b=e.target.closest('button[data-k]');if(!b)return;var k=b.dataset.k,d=b.dataset.d;
  if(k==='c'){S.coca=d==='x'?0:Math.max(0,S.coca+(+d))}else{var i=+k.slice(1),o=S.order[i];if(!o)return;if(d==='x')S.order.splice(i,1);else{o.qty+=+d;if(o.qty<1)S.order.splice(i,1)}}
  if(d==='1')buzz();renderOrder();var again=$('#shList button[data-k="'+k+'"][data-d="'+d+'"]');(again||$('#shX')).focus({preventScroll:true})});
$('#shCoca').onclick=function(){S.coca++;buzz();renderOrder()};
$('#shBody').addEventListener('click',function(e){if(e.target.closest('[data-again]'))reorder()});
$$('#shTipo button').forEach(function(b){b.onclick=function(){setTipo(b.dataset.v)}});
$$('#shTipo button').forEach(function(x){x.classList.toggle('on',x.dataset.v===info.tipo)});
$('#shBack').onclick=function(){setStep(S.step==='form'||S.step==='confirm'?'ask':'cart')};
}

export function init2(){
$('#shSend').addEventListener('click',function(e){if(!S.order.length&&!S.coca){e.preventDefault();return}
  if(S.step==='cart'){if(info.tipo==='retirada'){info.addr=null;doSend(e,this);return}e.preventDefault();setStep('ask');return}
  var er=formErr();if(er){e.preventDefault();$('#formErr').textContent=er.m;$(er.f).focus();return}
  info.addr=formAddr();info.addrSrc='form';doSend(e,this)});
window.__openSheet=openSheet;
window.__closeSheet=closeSheet;
$('#shX').onclick=function(){closeSheet()};
sbd.onclick=function(){closeSheet()};
document.addEventListener('keydown',function(e){if(!sheetOpen)return;if(e.key==='Escape'){closeSheet();return}
  if(e.key==='Tab'){var f=$$('button:not([hidden]),a[href],input,select,textarea',sheet).filter(function(n){return n.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
// arrastar pra baixo fecha (alça/cabeçalho, ou o corpo quando já está no topo)
(function(){var y0=null,dy=0,t0=0;
  function start(y){y0=y;dy=0;t0=performance.now();sheet.classList.add('drag')}
  function move(y){if(y0==null)return;dy=Math.max(0,y-y0);sheet.style.transform='translateY('+dy+'px)';sbd.style.opacity=String(Math.max(0,1-dy/420))}
  function end(){if(y0==null)return;var v=dy/Math.max(1,performance.now()-t0);y0=null;sheet.classList.remove('drag');sbd.style.opacity='';
    if(dy>110||(v>.55&&dy>28))closeSheet();else sheet.style.transform=''}
  [$('#shGrab'),$('#shHead')].forEach(function(n){
    n.addEventListener('pointerdown',function(e){if(innerWidth>=980||e.target.closest('button'))return;start(e.clientY);try{n.setPointerCapture(e.pointerId)}catch(_){}});
    n.addEventListener('pointermove',function(e){move(e.clientY)});n.addEventListener('pointerup',end);n.addEventListener('pointercancel',end)});
  var body=$('#shBody'),by=null;
  body.addEventListener('touchstart',function(e){by=(innerWidth<980&&body.scrollTop<=0&&!e.target.closest('.loc-map,input,select,textarea'))?e.touches[0].clientY:null},{passive:true});
  body.addEventListener('touchmove',function(e){if(by==null)return;var y=e.touches[0].clientY;if(y0==null){if(y-by>6)start(by);else return}move(y);if(e.cancelable)e.preventDefault()},{passive:false});
  body.addEventListener('touchend',function(){by=null;end()},{passive:true})})();
}
