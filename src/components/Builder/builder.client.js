/* components/Builder/builder.client.js — lógica do cliente (vanilla JS, ES module) */
import { paintFld } from '../FlavorPicker/flavor-picker.client.js';
import { toast } from '../Toast/toast.client.js';
import { pizzaPrice } from '../../lib/cart-store.js';
import { ALL, L, byName } from '../../lib/catalog.js';
import { PizzaViz } from '../../lib/pizza-engine.js';
import { $, $$, CFG, brl0, reduce } from '../../lib/utils.js';

export let viz, cur, CK, lastIng;

export function opts(sel){var g=function(lbl,arr){return '<optgroup label="'+lbl+'">'+arr.map(function(f){return '<option value="'+f.nome+'">'+f.nome+' — '+(f.preco==null?'consulte':'R$ '+f.preco)+'</option>'}).join('')+'</optgroup>'};
  sel.innerHTML='<option value="">Escolha o sabor…</option>'+(L&&L.ativo?g('Lançamento',ALL.filter(function(f){return f.launch})):'')+g('Salgadas',ALL.filter(function(f){return!f.doce}))+g('Doces',ALL.filter(function(f){return f.doce&&!f.launch}))}

export function renderIng(){var box=$('#ing'),gs=[];
  [['A',cur.a],['B',cur.mode==='meio'?cur.b:null]].forEach(function(p,ix){var f=p[1];if(!f)return;var rem=cur['rem'+p[0]];
    gs.push('<div class="ing-g" data-w="'+p[0]+'"><div class="ing-h"><b>'+(cur.mode==='meio'?'½ ':'')+f.nome+'</b><span>'+(cur.mode==='meio'?(ix?'lado direito':'lado esquerdo'):'ingredientes')+'</span></div><div class="chips" role="group" aria-label="Ingredientes de '+f.nome+'">'+
      (f.itens||[]).map(function(i,k){var on=!rem.has(i.id);return '<button type="button" class="ck in'+(i.fixo?' fx':'')+'" role="checkbox" aria-checked="'+on+'"'+(i.fixo?' aria-disabled="true" title="Base do sabor"':'')+' data-id="'+i.id+'" style="animation-delay:'+(k*60)+'ms"><span class="bx">'+CK+'</span><span class="t">'+i.nome+'</span></button>'}).join('')+'</div></div>')});
  box.innerHTML=gs.join('')+(gs.length?'<p class="ing-note">Toque para tirar um ingrediente — o preço não muda.</p>':'');
  $$('.ck',box).forEach(function(b){b.onclick=function(){if(b.classList.contains('fx'))return;var w=b.closest('.ing-g').dataset.w,id=b.dataset.id,rem=cur['rem'+w],on=rem.has(id);
    if(on)rem.delete(id);else rem.add(id);b.classList.remove('in');b.setAttribute('aria-checked',on);viz.toggle(w,id,on);updLbl();track('ingredient_toggle',{ingredient:id,on:on})}})}

export function updLbl(){$('#halfLbl').textContent=cur.a?(cur.mode==='meio'?cur.a.nome+' / '+(cur.b?cur.b.nome:'escolha a 2ª metade'):cur.a.nome)+(cur.borda?' + borda':''):'Sua pizza'}

export function syncViz(){viz.set({mode:cur.mode,a:cur.a,b:cur.mode==='meio'?cur.b:null,borda:cur.borda,remA:cur.remA,remB:cur.remB});
  var ik=cur.mode+'|'+(cur.a&&cur.a.nome)+'|'+(cur.mode==='meio'&&cur.b&&cur.b.nome);if(ik!==lastIng){lastIng=ik;renderIng()}
  var p=pizzaPrice(cur);$('#curPrice').textContent=!cur.a?'—':p==null?'consulte':brl0(p);
  $('#vizHint').style.opacity=cur.a?0:1;$('#addBtn').disabled=!cur.a||(cur.mode==='meio'&&!cur.b);
  updLbl();paintFld()}

export function pick(nome,src){var f=byName(nome);if(!f)return;
  if(cur.mode==='meio'&&cur.a&&!cur.b){cur.b=f;cur.remB=new Set();$('#sB').value=nome}else{cur.a=f;cur.remA=new Set();$('#sA').value=nome}
  // rola até a pizza e só então começa a montagem, para o cliente ver cada etapa
  var t=$('.viz-col'),far=Math.abs(t.getBoundingClientRect().top)>innerHeight*.6;
  if(far)scrollTo({top:t.getBoundingClientRect().top+scrollY-(innerWidth<980?76:100),behavior:reduce?'auto':'smooth'});
  setTimeout(syncViz,far&&!reduce?650:0);toast(nome,src)}

export function init(){
/* ================= 1) MONTE SUA PIZZA ================= */
 viz=new PizzaViz($('#pizzaViz'));
 cur={mode:'inteira',a:null,b:null,borda:false,remA:new Set(),remB:new Set()};
}

export function init2(){
opts($('#sA'));
opts($('#sB'));
 CK='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.4l2.4 2.4 5.2-5.4"/></svg>';
 lastIng='';
$$('#modeSeg button').forEach(function(b){b.onclick=function(){$$('#modeSeg button').forEach(function(x){x.classList.toggle('on',x===b)});cur.mode=b.dataset.v;$('#bWrap').hidden=cur.mode!=='meio';$('#aLbl').textContent=cur.mode==='meio'?'Metade 1':'Sabor';syncViz()}});
$('#sA').onchange=function(){cur.a=byName(this.value);cur.remA=new Set();syncViz()};
$('#sB').onchange=function(){cur.b=byName(this.value);cur.remB=new Set();syncViz()};
$('#borda').onchange=function(){cur.borda=this.checked;syncViz();track('borda_toggle',{on:cur.borda,nav:true})};
$$('[data-preco]').forEach(function(e){var k=e.dataset.preco;e.textContent=(k==='borda'?'+ ':'')+brl0(k==='borda'?CFG.bordaPreco:CFG.cocaPreco)});
window.__pick=pick;
}
