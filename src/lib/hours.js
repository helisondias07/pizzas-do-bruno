/* lib/hours.js — lógica do cliente (vanilla JS, ES module) */
import { renderSheet } from '../components/CartSheet/cart-sheet.client.js';
import { updAmb } from './sound.js';
import { $, $$, CFG } from './utils.js';

export let DIAS, FORCE, ST;

export function spNow(){var p={};new Intl.DateTimeFormat('en-US',{timeZone:CFG.timezone,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
  return{dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),min:(+p.hour%24)*60+(+p.minute)}}

export function status(){var n=spNow(),D=CFG.diasAbertos,isOpen=D.indexOf(n.dow)>-1&&n.min>=CFG.abre&&n.min<CFG.fecha;
  if(FORCE)isOpen=FORCE==='aberto';
  if(isOpen){return{open:true,txt:'Forno aceso até 23h',long:'Forno aceso até 23h · peça agora e receba quentinha',short:'Aberto agora'}}
  for(var i=0;i<8;i++){var d=(n.dow+i)%7;if(D.indexOf(d)>-1&&(i>0||n.min<CFG.abre)){var diff=i*1440+CFG.abre-n.min,dd=Math.floor(diff/1440),hh=Math.floor(diff%1440/60),mm=diff%60;
    var cd=dd?dd+'d '+hh+'h':hh?hh+'h '+mm+'min':mm+'min',q=i===0?'hoje':i===1?'amanhã':DIAS[d];
    return{open:false,quando:q+' às 18h',txt:'Forno apagado · abre '+q+' às 18h',long:'Forno apagado · abre '+q+' às 18h · faltam '+cd,cd:cd,short:'Fechado agora'}}}}

export function applyStatus(){ST=status();
  $$('[data-status]').forEach(function(e){e.textContent=ST.txt});$$('[data-status-long]').forEach(function(e){e.textContent=ST.long});$$('[data-status-short]').forEach(function(e){e.textContent=ST.open?ST.txt:'Abre '+ST.quando});
  var oh=$('#ovenTtl');if(oh){oh.innerHTML=ST.open?'Forno <em>aceso</em> até 23h':'Forno <em>apagado</em>';
    $('#ovenSub').textContent=ST.open?'A lenha está estalando. Monte sua pizza e mande pro Bruno enquanto o forno está quente.':'Abre '+ST.quando+' · faltam '+ST.cd+'. Dá pra deixar seu pedido agendado agora.'}
  document.documentElement.classList.toggle('is-open',ST.open);document.documentElement.classList.toggle('is-closed',!ST.open);
  var h=$('#heroCta');if(h)h.dataset.state=ST.open?'aberto':'fechado';
  var s=$('#stickyCta');if(s)s.dataset.src=ST.open?'sticky':'scheduled';
  var b=$('#sendBtn');if(b)b.querySelector('span.t').textContent=ST.open?'Pedir pelo WhatsApp':'Deixar pedido agendado';if(typeof renderSheet==='function'&&window.__ready)renderSheet();
  var bn=$('#schedNote');if(bn)bn.textContent=ST.open?'':'Estamos fechados agora. Seu pedido vai como agendado para '+ST.quando+'.';
}

export function init(){
/* ================= 2) STATUS ABERTO/FECHADO ================= */
 DIAS=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
// ?estado=aberto | ?estado=fechado força o estado (útil para testar/apresentar)
 FORCE=(location.search.match(/[?&]estado=(aberto|fechado)/)||[])[1]||null;
window.__setEstado=function(v){FORCE=v;applyStatus()};
 ST=status();
applyStatus();
setInterval(function(){applyStatus();updAmb()},30000);
}
