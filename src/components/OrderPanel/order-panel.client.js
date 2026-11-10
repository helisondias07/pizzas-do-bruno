/* components/OrderPanel/order-panel.client.js — lógica do cliente (vanilla JS, ES module) */
import { S } from '../../lib/state.js';
import { bumpCart, updSticky } from '../BottomBar/bottom-bar.client.js';
import { cur, syncViz } from '../Builder/builder.client.js';
import { openSheet, renderSheet } from '../CartSheet/cart-sheet.client.js';
import { paintTipo } from '../DeliveryChoice/delivery-choice.client.js';
import { toastMsg } from '../Toast/toast.client.js';
import { doSend } from '../../lib/address.js';
import { info, label, pizzaPrice, totals } from '../../lib/cart-store.js';
import { playPackAnimation } from '../../lib/pack-animation.js';
import { $, $$, brl, brl0, buzz, reduce } from '../../lib/utils.js';

// total que sobe como contador
export function tick(el,to,suf){var from=+(el.dataset.v||0);el.dataset.v=to;if(reduce||from===to){el.textContent=brl(to)+suf;return}
  var t0=performance.now(),D=650;cancelAnimationFrame(el._raf);(function f(n){var k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3),v=from+(to-from)*e;
    el.textContent=brl(Math.round(v*100)/100)+suf;if(k<1)el._raf=requestAnimationFrame(f)})(t0);
  if(to>from)el.animate&&el.animate([{color:'#D7282F'},{color:''}],{duration:900})}

export function koala(){var k=$('#koa');if(!k||reduce)return;var m=['Boa escolha!','Hmm, essa é boa!','Fome de respeito!','Excelente!'];k.querySelector('em').textContent=m[Math.floor(Math.random()*m.length)];k.classList.remove('pop');void k.offsetWidth;k.classList.add('pop')}

export function renderOrder(){var ol=$('#orderList');if(typeof paintTipo==='function')paintTipo();
  ol.innerHTML=S.order.map(function(o,i){var p=pizzaPrice(o);return '<li><div class="ol-n"><b>'+o.qty+'×</b> '+label(o)+'</div><div class="ol-p">'+(p==null?'consulte':brl0(p*o.qty))+'</div><div class="ol-q"><button aria-label="Menos" data-i="'+i+'" data-d="-1">−</button><button aria-label="Mais" data-i="'+i+'" data-d="1">+</button></div></li>'}).join('')||'<li class="empty">Nenhuma pizza ainda. Monte acima e toque em “Adicionar”.</li>';
  $$('button[data-i]',ol).forEach(function(b){b.onclick=function(){var o=S.order[+b.dataset.i];o.qty+= +b.dataset.d;if(o.qty<1)S.order.splice(+b.dataset.i,1);if(+b.dataset.d>0)buzz();renderOrder()}});
  $('#cocaQ').textContent=S.coca;var t=totals();
  tick($('#tSub'),t.sub,'');$('#tFee').textContent=t.fee.txt;tick($('#tTot'),t.total,t.unk||t.fee.unk?' +':'');
  $('#tNote').textContent=t.unk?'Itens com preço “consulte” serão confirmados pelo Bruno.':t.fee.unk?'Taxa de entrega a confirmar no WhatsApp.':'';
  var cnt=S.order.reduce(function(a,o){return a+o.qty},0)+S.coca;$('#cartCount').textContent=cnt;var c2=$('#cartCount2');c2.textContent=cnt;c2.hidden=!cnt;
  renderSheet();updSticky()}

export function init(){
$('#addBtn').onclick=function(){if(!cur.a)return;var it={mode:cur.mode,a:cur.a,b:cur.mode==='meio'?cur.b:null,borda:cur.borda,remA:new Set(cur.remA),remB:new Set(cur.mode==='meio'?cur.remB:[]),qty:1};
  var add=function(){var k=label(it),ex=S.order.filter(function(o){return label(o)===k})[0];if(ex)ex.qty++;else S.order.push(it);renderOrder();koala();buzz();$('#addBtn').classList.remove('nudge');bumpCart();
    toastMsg('<b>Pizza adicionada!</b> <button type="button" class="tl" data-open-cart>Ver pedido e pedir pelo WhatsApp</button>');track('add_to_cart',{flavor:k});
    if(!reduce&&$('#orderList').lastElementChild)$('#orderList').lastElementChild.animate([{transform:'translateY(10px)',opacity:0},{transform:'none',opacity:1}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'})};
  var svg=$('#pizzaViz')&&$('#pizzaViz').querySelector('svg');
  Promise.resolve(playPackAnimation(svg)).then(add)};
$('#cocaMinus').onclick=function(){S.coca=Math.max(0,S.coca-1);renderOrder()};
$('#cocaPlus').onclick=function(){S.coca++;buzz();bumpCart();renderOrder()};
}

export function init2(){
renderOrder();
syncViz();
}

export function init3(){
$('#sendBtn').addEventListener('click',function(e){
  if(!S.order.length&&cur.a&&!(cur.mode==='meio'&&!cur.b))$('#addBtn').click();
  if(!S.order.length&&!S.coca){e.preventDefault();toastMsg('Adicione pelo menos uma pizza ao pedido.');return}
  if(info.tipo==='retirada'){info.addr=null;doSend(e,this);return}
  e.preventDefault();openSheet(this,'ask')});
}
