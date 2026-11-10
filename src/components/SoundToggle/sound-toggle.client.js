/* components/SoundToggle/sound-toggle.client.js — lógica do cliente (vanilla JS, ES module) */
import { S } from '../../lib/state.js';
import { toastMsg } from '../Toast/toast.client.js';
import { AC, SKEY, ambVis, sUnlock, updAmb } from '../../lib/sound.js';
import { $, $$ } from '../../lib/utils.js';

export function init(){
/* ---- som: botão (cicla all → sfx → off), observadores da lareira, ganchos de clique ---- */
(function(){var b=$('#sndBtn');if(!b)return;if(!AC){b.hidden=true;return}
  var L={all:['Som ligado · lareira acesa','Som: efeitos e lareira. Toque para deixar só os efeitos'],sfx:['Só efeitos · lareira desligada','Som: só efeitos. Toque para desligar'],off:['Som desligado','Som desligado. Toque para ligar']};
  function paint(){b.dataset.m=S.sMode;b.setAttribute('aria-label',L[S.sMode][1]);b.setAttribute('aria-pressed',S.sMode!=='off')}
  paint();
  b.addEventListener('click',function(){S.sMode=S.sMode==='all'?'sfx':S.sMode==='sfx'?'off':'all';try{localStorage.setItem(SKEY,S.sMode)}catch(e){}
    paint();if(S.sMode!=='off'){sUnlock();setTimeout(function(){window.__sfx('tap',0,{f:520,v:.8})},30)}updAmb();toastMsg('<b>'+L[S.sMode][0]+'</b>');track('sound_toggle',{mode:S.sMode,nav:true})});
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){ambVis[e.target.id||e.target.className]=e.isIntersecting});updAmb()},{threshold:.25});
    $$('.hero,#forno,#montar').forEach(function(n){io.observe(n)})}
  // "Pedir pelo WhatsApp": ding (só quando o link realmente abre)
  document.addEventListener('click',function(e){var a=e.target.closest('a[href*="wa.me"]');if(a&&!e.defaultPrevented)window.__sfx('ding',0)});
  $('#addBtn').addEventListener('click',function(){if(!this.disabled)window.__sfx('add',0)});
  $('#cocaPlus').addEventListener('click',function(){window.__sfx('add',0)});
})();
}
