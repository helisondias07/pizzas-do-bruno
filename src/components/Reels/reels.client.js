/* components/Reels/reels.client.js — lógica do cliente (vanilla JS, ES module) */
import { $, $$, BASE, reduce } from '../../lib/utils.js';
import { card } from '../../lib/reels-markup.js';

export function init(){
/* ===== Reels (só reels, sem stories): renderiza de reels.json, formato do Graph API /me/media filtrado por REELS ===== */
(function(){var row=$('#reelsRow');if(!row)return;
  var saveData=navigator.connection&&navigator.connection.saveData,io=null;
  function vidOf(el){var v=el.querySelector('video');if(v)return v;var img=el.querySelector('img');v=document.createElement('video');
    v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.loop=true;v.preload='none';
    v.setAttribute('aria-hidden','true');if(img)v.poster=img.currentSrc||img.src;v.src=el.dataset.media;
    el.insertBefore(v,el.querySelector('.who'));v.addEventListener('playing',function(){el.classList.add('vid')});v.addEventListener('error',function(){el.classList.remove('vid','playing')});return v}
  function play(el){$$('.reel.playing',row).forEach(function(o){if(o!==el)pause(o)});var v=vidOf(el),p=v.play();el.classList.add('playing');setBtn(el,true);if(p&&p.catch)p.catch(function(){el.classList.remove('playing');setBtn(el,false)})}
  function pause(el){var v=el.querySelector('video');if(v)v.pause();el.classList.remove('playing');setBtn(el,false)}
  function setBtn(el,on){var b=el.querySelector('button.play');if(b){b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',(on?'Pausar: ':'Reproduzir: ')+b.getAttribute('aria-label').replace(/^(Pausar|Reproduzir): /,''))}}
  function wire(){var vids=$$('.reel[data-media]',row);if(!vids.length)return;
    row.addEventListener('click',function(e){var b=e.target.closest('button.play');if(!b)return;var el=b.closest('.reel');el.dataset.user='1';el.classList.contains('playing')?pause(el):play(el)});
    // em vista: toca sozinho (mudo), menos com movimento reduzido ou economia de dados; fora de vista: pausa
    if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(en){var el=en.target;
      if(en.isIntersecting&&en.intersectionRatio>=.6){if(!reduce&&!saveData&&!el.dataset.user)play(el)}else if(el.classList.contains('playing'))pause(el)})},{threshold:[0,.6]});vids.forEach(function(v){io.observe(v)})}}
  function render(list){var sig=list.map(function(r){return r.id}).join(),cur=$$('.reel',row).map(function(e){return e.dataset.id}).join();
    if(sig!==cur||list.some(function(r){return r.media_url}))row.innerHTML=list.map(card).join('');wire()}
  window.__reels={render:render,card:card};
  fetch(BASE+'reels.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var list=(Array.isArray(d)?d:d&&d.data||[]).filter(function(r){return r&&r.thumbnail_url&&(!r.media_product_type||r.media_product_type==='REELS')});
    if(list.length)render(list.slice(0,12))}).catch(function(){/* mantém os reels estáticos do HTML */});
})();
}
