/* lib/sound.js — lógica do cliente (vanilla JS, ES module) */
import { S } from './state.js';
import { ST } from './hours.js';
import { reduce } from './utils.js';
/* estado compartilhado (S): sMode */

export let SKEY, sArmed, sQ, ambVis, AC, ambT;
export function sGet(){try{var v=localStorage.getItem(SKEY);if(v==='all'||v==='sfx'||v==='off')return v}catch(e){}return reduce?'sfx':'all'}

export function sUnlock(){if(!AC)return;try{var ac=window.__bpAC||(window.__bpAC=new AC());if(ac.state!=='running'&&ac.resume)ac.resume();
    if(!sArmed){var b=ac.createBuffer(1,1,22050),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start(0)}}catch(e){return}
  if(sArmed)return;sArmed=true;
    window.__sndReady=function(){var now=performance.now();sQ.forEach(function(q){var left=(q[1]||0)-(now-q[3]);if(left>-80)window.__snd.play(q[0],Math.max(0,left),q[2])});sQ=[];updAmb()};
  import('./sound-engine.js')}

export function ambWant(){return S.sMode==='all'&&typeof ST!=='undefined'&&ST.open&&!document.hidden&&Object.keys(ambVis).some(function(k){return ambVis[k]})}

export function updAmb(){if(!window.__snd)return;clearTimeout(ambT);if(ambWant()||document.hidden||S.sMode!=='all')window.__snd.amb(ambWant());else ambT=setTimeout(function(){window.__snd.amb(ambWant())},600)}

export function init(){
/* ================= SOM =================
   Nada de áudio até o 1º toque. No 1º gesto: cria/destrava o AudioContext (iOS/Instagram: também no touchend)
   e só então carrega sound.js (sons 100% sintetizados). Preferência salva: all = efeitos + lareira, sfx = só efeitos, off. */
 SKEY='brunos:som',sArmed=false,sQ=[],ambVis={},AC=window.AudioContext||window.webkitAudioContext;
 S.sMode=AC?sGet():'off';
window.__sfx=function(t,d,o){if(window.__sfxLog)window.__sfxLog.push([performance.now()+(d||0),t,o||{}]);
  if(S.sMode==='off'||!sArmed)return;if(window.__snd)window.__snd.play(t,d,o);else sQ.push([t,d,o,performance.now()])};
['touchend','pointerdown','keydown','click'].forEach(function(ev){addEventListener(ev,function(e){if(S.sMode!=='off')sUnlock()},{capture:true,passive:true})});
// lareira: só com forno aceso, área do forno/hero/montador na tela e aba visível
  // pequena folga ao rolar entre seções
document.addEventListener('visibilitychange',function(){updAmb();var ac=window.__bpAC;if(!ac)return;
  if(document.hidden)setTimeout(function(){if(document.hidden&&ac.suspend)ac.suspend()},1400);else if(S.sMode!=='off'&&sArmed&&ac.resume)ac.resume()});
}
