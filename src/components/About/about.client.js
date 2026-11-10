/* components/About/about.client.js — lógica do cliente (vanilla JS, ES module) */
import { onS } from '../BottomBar/bottom-bar.client.js';
import { $, $$, reduce, shot } from '../../lib/utils.js';

export let story, words, plate, pars, zooms, tk;

export function frame(){onS();if(reduce||shot)return;var y=scrollY,vh=innerHeight;
  if(y<vh*1.2)plate.style.transform='rotate('+(y*.09)+'deg) translateY('+(y*.08)+'px)';
  var r=story.getBoundingClientRect(),p=Math.min(1,Math.max(0,(vh*.8-r.top)/(r.height+vh*.3)));words.forEach(function(w,i){w.style.opacity=i/words.length<p?1:.16});
  pars.forEach(function(i){var b=i.parentNode.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;var q=(b.top+b.height/2-vh/2)/vh;i.style.transform='translateY('+(q*-8)+'%)'});
  zooms.forEach(function(i){var b=i.parentNode.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;var q=Math.min(1,Math.max(0,1-(b.top/vh)));i.style.transform='scale('+(1.15-.15*q)+')'})}

export function init(){
/* ================= Animações leves (sem libs) ================= */
 story=$('#story');
story.innerHTML=story.innerHTML.replace(/(<em>.*?<\/em>)|([^\s<]+)/g,function(m){return '<span class="w">'+m+'</span>'});
 words=$$('.w',story),plate=$('#plate'),pars=$$('[data-par]'),zooms=$$('[data-zoom]');
 tk=false;
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(function(){frame();tk=false})}},{passive:true});
frame();
if(reduce||shot){words.forEach(function(w){w.style.opacity=1})}
}
