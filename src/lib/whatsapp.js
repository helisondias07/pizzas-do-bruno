/* lib/whatsapp.js — lógica do cliente (vanilla JS, ES module) */
import { S } from './state.js';
import { addrLine } from './address.js';
import { info, pizzaPrice, sem, totals } from './cart-store.js';
import { ST } from './hours.js';
import { $, $$, CFG, COARSE, brl } from './utils.js';

export function wa(msg){return 'https://wa.me/'+CFG.whatsapp+'?text='+encodeURIComponent(msg)}

// Mensagem simples, fácil de bater o olho no atendimento (sem pagamento, sem dados pessoais)
export function val(s){var e=$(s);return e?e.value.trim():''}

export function semTxt(f,rem){return sem(f,rem).replace(/^ \(|\)$/g,'')}

export function msgItem(o){var L2=[],p=pizzaPrice(o),cons=p==null?' (valor a consultar)':'';
  if(o.mode==='meio'){L2.push(o.qty+'x Pizza meio a meio'+cons);L2.push('- 1/2 '+o.a.nome+sem(o.a,o.remA));L2.push('- 1/2 '+o.b.nome+sem(o.b,o.remB))}
  else L2.push(o.qty+'x Pizza '+o.a.nome+sem(o.a,o.remA)+cons);
  if(o.borda)L2.push('- Borda Catupiry');return L2}

export function bairroNome(){return info.bairro&&info.bairro!=='__outro'?info.bairro:''}

export function mapsUrl(){return S.loc?'https://maps.google.com/?q='+S.loc.lat+','+S.loc.lng:''}

export function totalLine(){var t=totals(),s='Total: '+brl(t.total);if(t.unk)s+=' + itens a consultar';
  if(info.tipo==='entrega')s+=(t.fee.unk||!info.bairro)?' (+ entrega)':' (com entrega de '+brl(t.fee.v)+')';return s}

export function buildMsg(){var L2=[];
  L2.push(ST.open?'Olá! Quero fazer um pedido:':'Olá! Quero deixar um pedido agendado para '+ST.quando+':','');
  S.order.forEach(function(o){L2.push.apply(L2,msgItem(o))});
  if(S.coca)L2.push(S.coca+'x Coca-Cola 1,5L');
  L2.push('',totalLine(),'');
  if(info.tipo==='entrega'){var A=info.addr;
    if(!A)L2.push('Entrega: endereço já cadastrado');
    else{L2.push('Entrega: '+addrLine(A));if(A.ref)L2.push('Referência: '+A.ref);if(A.lat!=null)L2.push('Localização: https://maps.google.com/?q='+A.lat+','+A.lng)}}
  else L2.push('Retirada no local');
  if(val('#fObs'))L2.push('Obs: '+val('#fObs'));
  return L2.join('\n')}

export function init(){
// no celular (inclui o navegador do Instagram) o wa.me abre na mesma aba → vai direto pro app, sem aba órfã
document.addEventListener('click',function(e){var a=e.target.closest('a[href*="wa.me"]');if(a&&COARSE)a.removeAttribute('target')},true);
}

export function init2(){
window.__buildMsg=buildMsg;
}

export function init3(){
/* ================= LINKS WhatsApp estáticos ================= */
$$('a[data-wa]').forEach(function(a){a.href=wa(a.dataset.wa||'Olá, Bruno! Vim pelo site e quero fazer um pedido 🍕');a.target='_blank';a.rel='noopener'});
}
