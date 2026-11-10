/* lib/cart-store.js — lógica do cliente (vanilla JS, ES module) */
import { S } from './state.js';
import { renderAgain } from '../components/Reorder/reorder.client.js';
import { BAIRROS } from '../data/index.js';
import { byName } from './catalog.js';
import { CFG, brl } from './utils.js';
/* estado compartilhado (S): order, coca, loc, step */

export let info, LS;

// Regra do meio a meio: cobra o sabor de MAIOR valor.
// ⚠ ASSUMIDO (padrão de mercado) — CONFIRMAR COM O BRUNO antes de publicar.
export function pizzaPrice(it){var pa=it.a&&it.a.preco,pb=it.b&&it.b.preco;if(!it.a)return 0;
  var base=it.mode==='meio'?(it.b?((pa==null||pb==null)?null:Math.max(pa,pb)):pa):pa;return base==null?null:base+(it.borda?CFG.bordaPreco:0)}

// remoções (sem custo): "sem cebola roxa, sem azeitona"
export function sem(f,rem){if(!f||!rem||!rem.size)return'';var n=(f.itens||[]).filter(function(i){return rem.has(i.id)}).map(function(i){return 'sem '+i.nome.toLowerCase()});return n.length?' ('+n.join(', ')+')':''}

export function label(it){return(it.mode==='meio'?'Meio a meio: 1/2 '+it.a.nome+sem(it.a,it.remA)+' + 1/2 '+(it.b?it.b.nome+sem(it.b,it.remB):'?'):it.a.nome+sem(it.a,it.remA))+(it.borda?' + borda Catupiry':'')}

export function fee(){if(info.tipo!=='entrega'||!info.bairro)return{v:0,txt:info.tipo==='entrega'?'escolha o bairro':'retirada — grátis'};
  if(info.bairro==='__outro')return{v:0,txt:'a combinar',unk:true};var b=BAIRROS.filter(function(x){return x.nome===info.bairro})[0];
  if(!b||!b.atende)return{v:0,txt:'fora da área',unk:true};return{v:b.taxa,txt:brl(b.taxa)}}

export function totals(){var sub=0,unk=false;S.order.forEach(function(o){var p=pizzaPrice(o);if(p==null)unk=true;else sub+=p*o.qty});sub+=S.coca*CFG.cocaPreco;var f=fee();return{sub:sub,fee:f,total:sub+f.v,unk:unk}}

export function saveLast(){try{localStorage.setItem(LS,JSON.stringify({v:1,t:Date.now(),coca:S.coca,tipo:info.tipo,bairro:info.bairro,
  items:S.order.map(function(o){return{m:o.mode,a:o.a.nome,b:o.b&&o.b.nome,bo:!!o.borda,ra:Array.from(o.remA||[]),rb:Array.from(o.remB||[]),q:o.qty}})}));renderAgain()}catch(e){}}

export function loadLast(){try{var d=JSON.parse(localStorage.getItem(LS)||'null');if(!d||d.v!==1||!Array.isArray(d.items))return null;
  d.list=d.items.map(function(x){var a=byName(x.a),b=x.b?byName(x.b):null;if(!a||(x.m==='meio'&&!b))return null;
    return{mode:x.m==='meio'?'meio':'inteira',a:a,b:b,borda:!!x.bo,remA:new Set(x.ra||[]),remB:new Set(x.rb||[]),qty:Math.max(1,Math.min(20,x.q|0||1))}}).filter(Boolean);
  d.coca=Math.max(0,Math.min(20,d.coca|0));return(d.list.length||d.coca)?d:null}catch(e){return null}}

export function init(){
 S.order=[],S.coca=0,info={tipo:'entrega',bairro:'',addr:null},S.loc=null,S.step='cart';
}

export function init2(){
/* ================= PEDIR DE NOVO (último pedido só neste aparelho) ================= */
 LS='brunos:ultimo-pedido';
}
