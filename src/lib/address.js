/* lib/address.js — lógica do cliente (vanilla JS, ES module) */
import { S } from './state.js';
import { viz } from '../components/Builder/builder.client.js';
import { closeSheet, openSheet, setStep, sheetOpen } from '../components/CartSheet/cart-sheet.client.js';
import { info, saveLast, totals } from './cart-store.js';
import { ST } from './hours.js';
import { $, buzz, reduce } from './utils.js';
import { buildMsg, val, wa } from './whatsapp.js';

export let LSA;

export function bName(b){return b&&b!=='__outro'?b:''}

export function addrLine(A){var b=bName(A.bairro),c=A.comp?' ('+A.comp+')':'';
  if(A.rua)return A.rua+(A.sn?', S/N':A.num?', '+A.num:'')+c+(b?' - '+b:'');
  return (b||'Bairro a confirmar')+c+(A.lat!=null?' (ver localização)':'')}

export function formAddr(){return{bairro:$('#bairro').value,rua:val('#fRua'),num:$('#fSN').checked?'':val('#fNum'),sn:$('#fSN').checked,comp:val('#fComp'),ref:val('#fRef'),lat:S.loc?S.loc.lat:null,lng:S.loc?S.loc.lng:null}}

export function formErr(){var A=formAddr();if(!A.bairro)return{m:'Escolha o bairro.',f:'#bairro'};if(!A.rua&&A.lat==null)return{m:'Digite a rua ou toque em “Usar minha localização”.',f:'#fRua'};return null}

export function needAddr(){return info.tipo==='entrega'&&!!formErr()}

export function savedAddr(){try{var a=JSON.parse(localStorage.getItem(LSA)||'null');return a&&a.bairro&&(a.rua||a.lat!=null)?a:null}catch(e){return null}}

export function saveAddr(A){try{localStorage.setItem(LSA,JSON.stringify(A))}catch(e){}}

export function goAddr(){if(sheetOpen)setStep('form');else openSheet(null,'form')}

export function doSend(e,a){if(info.tipo==='entrega'&&info.addr&&info.addrSrc==='form')saveAddr(info.addr);var msg=buildMsg();a.href=wa(msg);var t=totals();saveLast();setTimeout(function(){closeSheet()},500);
  track('generate_lead',{source:ST.open?(a.id==='shSend'?'minicart':'builder'):'scheduled',value:t.total,lead:true});viz.bake();buzz(18);
  var ot=$('#ovenToast');ot.querySelector('b').textContent=ST.open?'Pizza no forno!':'Pedido agendado!';ot.classList.add('show');setTimeout(function(){ot.classList.remove('show')},reduce?1200:2000);
  var ob=$('#forno');if(ob&&!reduce){ob.classList.remove('flare');void ob.offsetWidth;ob.classList.add('flare')}}

export function init(){
// endereço em campos separados → linha simples pro atendente
 LSA='brunos:endereco';
}
