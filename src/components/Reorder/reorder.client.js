/* components/Reorder/reorder.client.js — lógica do cliente (vanilla JS, ES module) */
import { S } from '../../lib/state.js';
import { bumpCart } from '../BottomBar/bottom-bar.client.js';
import { openSheet, renderSheet } from '../CartSheet/cart-sheet.client.js';
import { setTipo } from '../DeliveryChoice/delivery-choice.client.js';
import { renderOrder } from '../OrderPanel/order-panel.client.js';
import { LS, info, loadLast } from '../../lib/cart-store.js';
import { $, buzz } from '../../lib/utils.js';

export function lastTxt(d){var p=d.list.map(function(o){return o.qty+'x '+(o.mode==='meio'?'½ '+o.a.nome+' + ½ '+o.b.nome:o.a.nome)+(o.borda?' c/ borda':'')});if(d.coca)p.push(d.coca+'x Coca-Cola');return p.join(' · ')}

export function renderAgain(){var d=loadLast(),w=$('#again');if(!d){w.hidden=true;return null}w.hidden=false;$('#agTxt').textContent=lastTxt(d);return d}

export function reorder(){var d=loadLast();if(!d)return;S.order=d.list;S.coca=d.coca;
  if(d.tipo==='retirada'||d.tipo==='entrega')setTipo(d.tipo);
  if(d.bairro&&$('#bairro').querySelector('option[value="'+CSS.escape(d.bairro)+'"]')){$('#bairro').value=d.bairro;info.bairro=d.bairro}
  renderOrder();buzz();bumpCart();track('reorder',{items:S.order.length});openSheet()}

export function init(){
$('#agGo').onclick=reorder;
$('#agX').onclick=function(){try{localStorage.removeItem(LS)}catch(e){}renderAgain();renderSheet()};
renderAgain();
}
