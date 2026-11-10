/* components/FlavorPicker/flavor-picker.client.js — lógica do cliente (vanilla JS, ES module) */
import { hideBy, updHide } from '../BottomBar/bottom-bar.client.js';
import { cur, syncViz } from '../Builder/builder.client.js';
import { sheetOpen } from '../CartSheet/cart-sheet.client.js';
import { ALL, byName } from '../../lib/catalog.js';
import { PizzaViz } from '../../lib/pizza-engine.js';
import { $, $$, brl0, buzz, reduce } from '../../lib/utils.js';

export let TPX, pk, pkBd, pkOpen, pkW, pkTab, pkFrom, SAL, DOC, vw;

export function thumbInto(box,st,urgent){if(!box||!window.PizzaViz||!PizzaViz.thumb)return;var k=(st.a?st.a.nome:'')+'|'+(st.b?st.b.nome:'');box.dataset.k=k;
  PizzaViz.thumb(st,TPX,function(u){if(box.dataset.k!==k)return;var im=box.querySelector('img');if(!im){im=new Image();im.alt='';im.decoding='async';box.appendChild(im)}
    if(im.src!==u){im.classList.remove('in');im.onload=function(){im.classList.add('in')};im.src=u}else im.classList.add('in')},urgent)}

export function paintFld(){['A','B'].forEach(function(w){var b=$('#pf'+w),f=w==='A'?cur.a:cur.b;if(!b)return;b.classList.toggle('has',!!f);
  b.querySelector('.pf-t').textContent=f?f.nome:(w==='B'?'Escolha a 2ª metade…':cur.mode==='meio'?'Escolha a 1ª metade…':'Escolha o sabor…');
  b.querySelector('.pf-p').textContent=f?(f.preco==null?'consulte':brl0(f.preco)):'';var th=b.querySelector('.pf-th');
  if(f)thumbInto(th,{a:f},true);else{th.dataset.k='';th.innerHTML=''}});
  var vw=$('#vizWrap');if(vw){vw.classList.toggle('mode-meio',cur.mode==='meio');$$('.viz-halves span',vw).forEach(function(s){s.classList.toggle('empty',cur.mode==='meio'&&!(s.dataset.w==='A'?cur.a:cur.b))});
    vw.setAttribute('aria-label',cur.a?'Trocar o sabor da pizza':'Escolher o sabor da pizza')}}

export function pkDesc(f){var t=(f.ingredientes||'').replace(/^Molho de tomate, mussarela, /,'').replace(/^Massa artesanal, /,'').replace(/\.$/,'');return t.charAt(0).toUpperCase()+t.slice(1)}

export function pkRender(){var list=pkTab==='s'?SAL:DOC,sel=pkW==='A'?cur.a:cur.b;
  $$('.pk-tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.t===pkTab)});
  $('#pkList').innerHTML=list.map(function(f,i){var on=sel&&sel.nome===f.nome;
    return '<li><button type="button" class="pk-row" role="option" aria-selected="'+!!on+'" data-n="'+f.nome.replace(/"/g,'&quot;')+'"><span class="pk-th" aria-hidden="true"></span><span class="pk-t">'+(f.launch?'<em>Novo</em>':'')+'<b>'+f.nome.replace(/ (c\/|e|com|de) /g,' $1\u00a0')+'</b><small>'+pkDesc(f)+'</small></span><span class="pk-p">'+(f.preco==null?'<small>consulte</small>':'<small>R$</small>'+f.preco)+'</span></button></li>'}).join('');
  $$('#pkList .pk-row').forEach(function(b){var f=byName(b.dataset.n);thumbInto(b.querySelector('.pk-th'),{a:f})});
  $$('#pkList .pk-row').forEach(function(b){b.onclick=function(){pkChoose(byName(b.dataset.n))}})}

export function openPicker(w,from){if(sheetOpen)return;pkW=w||'A';pkFrom=from||document.activeElement;var sel=pkW==='A'?cur.a:cur.b;pkTab=sel?(sel.doce?'d':'s'):(pkW==='B'&&cur.a&&cur.a.doce?'d':'s');
  var meio=cur.mode==='meio';$('#pkTtl').textContent=meio?(pkW==='A'?'Sabor da 1ª metade':'Sabor da 2ª metade'):(sel?'Trocar o sabor':'Escolha o sabor');
  var sub=$('#pkSub');sub.classList.toggle('none',!meio);sub.querySelector('.pk-half').classList.toggle('b',pkW==='B');sub.querySelector('span').textContent=meio?'Meio a meio · cobra o sabor de maior valor':'';
  pkRender();pkOpen=true;pk.hidden=false;pkBd.hidden=false;void pk.offsetWidth;pk.classList.add('on');pkBd.classList.add('on');document.documentElement.classList.add('sheet-open');hideBy.pk=true;updHide();
  var body=$('.pk-body',pk),s=$('#pkList [aria-selected=true]');body.scrollTop=0;if(s)s.scrollIntoView({block:'center'});
  setTimeout(function(){(s||$('#pkList .pk-row')||pk).focus({preventScroll:true})},reduce?0:80);track('flavor_picker_open',{half:meio?pkW:'',nav:true})}

export function closePicker(cb){if(!pkOpen)return;pkOpen=false;pk.classList.remove('on');pkBd.classList.remove('on');document.documentElement.classList.remove('sheet-open');hideBy.pk=false;updHide();
  setTimeout(function(){if(!pkOpen){pk.hidden=true;pkBd.hidden=true}if(cb)cb();else if(pkFrom&&pkFrom.focus)pkFrom.focus({preventScroll:true})},reduce?0:340)}

export function pkChoose(f){if(!f)return;var w=pkW;buzz();closePicker(function(){
  if(w==='B'){cur.b=f;cur.remB=new Set();$('#sB').value=f.nome}else{cur.a=f;cur.remA=new Set();$('#sA').value=f.nome}
  var t=$('.viz-col'),r=t.getBoundingClientRect(),far=r.top<-r.height*.35||r.top>innerHeight*.45;
  if(far)scrollTo({top:r.top+scrollY-(innerWidth<980?76:100),behavior:reduce?'auto':'smooth'});
  setTimeout(syncViz,far&&!reduce?600:60);track('flavor_pick',{flavor:f.nome,half:cur.mode==='meio'?w:'',src:'picker',nav:true});
  if(pkFrom&&pkFrom.focus)pkFrom.focus({preventScroll:true})})}

export function init(){
/* ================= SELETOR DE SABOR (miniaturas montadas pelo mesmo motor SVG) ================= */
 TPX=112;
 pk=$('#pk'),pkBd=$('#pkBd'),pkOpen=false,pkW='A',pkTab='s',pkFrom=null;
 SAL=ALL.filter(function(f){return!f.doce}),DOC=ALL.filter(function(f){return f.doce}).sort(function(a,b){return(b.launch?1:0)-(a.launch?1:0)});
$('#pkTabS small').textContent=SAL.length;
$('#pkTabD small').textContent=DOC.length;
$$('.pk-tabs button').forEach(function(b){b.onclick=function(){if(pkTab===b.dataset.t)return;pkTab=b.dataset.t;pkRender();$('.pk-body',pk).scrollTop=0}});
$('#pkX').onclick=function(){closePicker()};
pkBd.onclick=function(){closePicker()};
document.addEventListener('keydown',function(e){if(!pkOpen)return;if(e.key==='Escape'){e.preventDefault();closePicker();return}
  if(e.key==='Tab'){var f=$$('button',pk).filter(function(x){return x.offsetParent}),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){var rows=$$('#pkList .pk-row'),i=rows.indexOf(document.activeElement);if(i>-1){e.preventDefault();var n=rows[Math.max(0,Math.min(rows.length-1,i+(e.key==='ArrowDown'?1:-1)))];n.focus()}}});
// arrastar para baixo fecha (mobile)
(function(){var g=$('.sh-grab',pk),h=$('.pk-h',pk),y0=null,dy=0;[g,h].forEach(function(el){el.addEventListener('touchstart',function(e){y0=e.touches[0].clientY;dy=0;pk.style.transition='none'},{passive:true});
  el.addEventListener('touchmove',function(e){if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);pk.style.transform='translateY('+dy+'px)'},{passive:true});
  el.addEventListener('touchend',function(){if(y0==null)return;y0=null;pk.style.transition='';pk.style.transform='';if(dy>90)closePicker()})})})();
// pizza tocável: inteira → sabor; meio a meio → a metade tocada
 vw=$('#vizWrap');
vw.addEventListener('click',function(e){var w='A';if(cur.mode==='meio'){var r=vw.getBoundingClientRect();w=(e.clientX||r.left)>r.left+r.width/2?'B':'A'}openPicker(w,vw)});
vw.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openPicker(cur.mode==='meio'&&cur.a&&!cur.b?'B':'A',vw)}});
$$('.pick-fld').forEach(function(b){b.onclick=function(){openPicker(b.dataset.w,b)}});
paintFld();
}
