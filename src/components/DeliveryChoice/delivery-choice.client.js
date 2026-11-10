/* components/DeliveryChoice/delivery-choice.client.js — lógica do cliente (vanilla JS, ES module) */
import { renderOrder } from '../OrderPanel/order-panel.client.js';
import { BAIRROS } from '../../data/index.js';
import { info } from '../../lib/cart-store.js';
import { $, $$, brl } from '../../lib/utils.js';

export let TIPO_IC;

export function tipoSub(){var b=info.bairro&&info.bairro!=='__outro'?BAIRROS.filter(function(x){return x.nome===info.bairro})[0]:null;
  return{entrega:b?(b.atende?'Taxa '+brl(b.taxa)+' · '+b.nome:b.nome+' · fora da área'):info.bairro==='__outro'?'Taxa a combinar':'Taxa conforme o bairro',retirada:'No balcão · sem taxa'}}

export function paintTipo(){var s=tipoSub(),v=info.tipo;$$('#tipoSeg button,#shTipo button').forEach(function(x){var on=x.dataset.v===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});
  $$('[data-tipo-sub]').forEach(function(e){e.textContent=s[e.dataset.tipoSub]});
  var ent=v==='entrega';$('#entNote').hidden=!ent;$('#retNote').hidden=ent;
  var n=$('#shTipoNote');if(n)n.textContent=ent?(info.bairro?'Endereço no próximo passo.':'Bairro, endereço e localização no próximo passo.'):'Sem taxa. O horário você combina com o Bruno no WhatsApp.'}

export function setTipo(v){info.tipo=v;paintTipo();renderOrder()}

export function init(){
/* Entrega × Retirada: dois cartões grandes (builder e mini-carrinho), mesmo estado */
 TIPO_IC={entrega:'<path d="M3 7h10v8H3zM13 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',retirada:'<path d="M4 10l1.5-5h13L20 10"/><path d="M4 10h16v9H4z"/><path d="M10 19v-5h4v5"/>'};
$$('#tipoSeg button,#shTipo button').forEach(function(b){var v=b.dataset.v;b.className=(b.className||'').replace(/\bon\b/,'').trim();b.setAttribute('aria-pressed','false');
  b.innerHTML='<span class="tp-ic" aria-hidden="true"><svg viewBox="0 0 24 24">'+TIPO_IC[v]+'</svg></span><span class="tp-t"><b>'+(v==='entrega'?'Entrega':'Retirada')+'</b><small data-tipo-sub="'+v+'"></small></span><span class="tp-ck" aria-hidden="true"></span>'});
$$('#tipoSeg button').forEach(function(b){b.onclick=function(){setTipo(b.dataset.v)}});
}
