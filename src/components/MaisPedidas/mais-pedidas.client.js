/* components/MaisPedidas/mais-pedidas.client.js — lógica do cliente (vanilla JS, ES module) */
import { cur, syncViz } from '../Builder/builder.client.js';
import { closeSheet, sheetOpen } from '../CartSheet/cart-sheet.client.js';
import { thumbInto } from '../FlavorPicker/flavor-picker.client.js';
import { toastMsg } from '../Toast/toast.client.js';
import { MAIS_PEDIDAS } from '../../data/index.js';
import { pizzaPrice } from '../../lib/cart-store.js';
import { byName, colOf } from '../../lib/catalog.js';
import { $, $$, brl0, buzz, reduce } from '../../lib/utils.js';

export let MP;

export function mpHTML(){return MP.map(function(m,i){var a=byName(m.a),b=m.b?byName(m.b):null,p=pizzaPrice({mode:b?'meio':'inteira',a:a,b:b,borda:!!m.borda});
  return '<button type="button" class="mpc" data-mp="'+i+'"><i'+(b?' class="h"':'')+' style="--c1:'+colOf(a)+(b?';--c2:'+colOf(b):'')+'" aria-hidden="true"></i><span>'+m.rot.replace(/ (c\/|e|com|de) /g,' $1\u00a0')+'<small>'+(p==null?'consulte':brl0(p))+'</small></span></button>'}).join('')}

export function mpThumbs(box){$$('.mpc',box).forEach(function(c){var m=MP[+c.dataset.mp];thumbInto(c.querySelector('i'),{a:byName(m.a),b:m.b?byName(m.b):null})})}

export function preset(m){var a=byName(m.a),b=m.b?byName(m.b):null;
  cur.mode=b?'meio':'inteira';$$('#modeSeg button').forEach(function(x){x.classList.toggle('on',x.dataset.v===cur.mode)});$('#bWrap').hidden=!b;$('#aLbl').textContent=b?'Metade 1':'Sabor';
  cur.a=a;cur.remA=new Set();$('#sA').value=a.nome;cur.b=b;cur.remB=new Set();$('#sB').value=b?b.nome:'';cur.borda=!!m.borda;$('#borda').checked=cur.borda;
  var t=$('.viz-col'),far=Math.abs(t.getBoundingClientRect().top)>innerHeight*.35;
  if(far)scrollTo({top:t.getBoundingClientRect().top+scrollY-(innerWidth<980?76:100),behavior:reduce?'auto':'smooth'});
  setTimeout(syncViz,far&&!reduce?600:0);buzz();
  var ab=$('#addBtn');ab.classList.remove('nudge');void ab.offsetWidth;ab.classList.add('nudge');
  toastMsg('Montando <b>'+m.rot+'</b>… Tire o que não quiser e toque em <b>Adicionar</b>.');track('quick_pick',{flavor:m.rot})}

export function bindMp(box){box.innerHTML=mpHTML();box.addEventListener('click',function(e){var c=e.target.closest('[data-mp]');if(!c)return;var m=MP[+c.dataset.mp];
  if(sheetOpen)closeSheet(function(){preset(m)});else preset(m)})}

export function init(){
 MP=(MAIS_PEDIDAS||[]).filter(function(m){return byName(m.a)&&(!m.b||byName(m.b))});
bindMp($('#mpRow'));
bindMp($('#shMp'));
(function(){var row=$('#mpRow'),wr=$('#mpScroll');function edge(){var mx=row.scrollWidth-row.clientWidth;wr.classList.toggle('fade-r',mx>4&&row.scrollLeft<mx-4);wr.classList.toggle('fade-l',row.scrollLeft>4)}
  row.addEventListener('scroll',edge,{passive:true});addEventListener('resize',edge);edge();
  // miniaturas das Mais pedidas: só quando o montador se aproxima (não pesa no carregamento)
  var done=false;function go(){if(done)return;done=true;mpThumbs(row);mpThumbs($('#shMp'))}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();go()}},{rootMargin:'600px 0px'});io.observe(row)}else go();
  $('#stickyCta').addEventListener('click',go)})();
}
