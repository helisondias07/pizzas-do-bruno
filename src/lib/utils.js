/* lib/utils.js — lógica do cliente (vanilla JS, ES module) */
import { CONFIG } from '../data/index.js';

/* base do site ("/" na Vercel, "/pizzas-do-bruno/" no GitHub Pages) */
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export let $, $$, CFG, reduce, shot, brl, brl0, COARSE;

/* ================= HÁPTICO (Android; iOS ignora) ================= */
export function buzz(ms){if(!COARSE||!navigator.vibrate)return;try{navigator.vibrate(ms||12)}catch(e){}}

export function init(){
 $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
 CFG=CONFIG,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,shot=/shot/.test(location.search);
if(reduce)document.documentElement.classList.add('rm');
 brl=function(v){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})};
 brl0=function(v){return 'R$ '+v};
}

export function init2(){
 COARSE=matchMedia('(pointer:coarse)').matches;
}
