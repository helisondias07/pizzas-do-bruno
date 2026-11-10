/* lib/catalog.js — lógica do cliente (vanilla JS, ES module) */
import { CARDAPIO, LANCAMENTO } from '../data/index.js';

export let C, L, ALL, byName, COL;

export function colOf(f){var ids=(f.itens||[]).map(function(i){return i.id});for(var k in COL)if(ids.indexOf(k)>-1)return COL[k];return '#F2CB6A'}

export function init(){
/* ================= DADOS ================= */
 C=CARDAPIO,L=LANCAMENTO;
 ALL=C.salgadas.map(function(f){return Object.assign({},f,{doce:false})}).concat(C.doces.map(function(f){return Object.assign({},f,{doce:true})}));
if(L&&L.ativo)ALL.push({n:'★',nome:L.nome,preco:L.preco,ingredientes:L.ingredientes,itens:L.itens||[],doce:true,launch:true});
 byName=function(n){return ALL.filter(function(f){return f.nome===n})[0]||null};
}

export function init2(){
/* ================= MAIS PEDIDAS (montam a pizza em 1 toque) ================= */
 COL={calabresa:'#B14A2E',frango:'#DDA766',bacon:'#A8452E',presunto:'#E79AA3',lombo:'#E59B95',tomate:'#E0352E',chocobranco:'#FBF0DC',nutella:'#5A2E1A',choco:'#5A2E1A',pistachecreme:'#B9C677',goiabada:'#9E1B2E'};
}
