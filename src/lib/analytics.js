/* lib/analytics.js — lógica do cliente (vanilla JS, ES module) */

export function init(){
/* ================= 7) TRACKING ================= */
// Dispara GA4 / Meta Pixel apenas se existirem na página.
window.track=function(event,params){params=params||{};
  try{if(typeof window.gtag==='function')window.gtag('event',event,params)}catch(e){}
  try{if(typeof window.fbq==='function'&&params.nav)window.fbq('trackCustom',event,{content_name:params.source})}catch(e){}
  try{if(typeof window.fbq==='function'&&!params.nav)window.fbq('track',params.lead?'Lead':'Contact',{content_name:params.source,value:params.value,currency:params.value?'BRL':undefined})}catch(e){}
  if(window.__trackLog)window.__trackLog.push([event,params]);
};
window.__trackLog=[];
document.addEventListener('click',function(e){var a=e.target.closest('a[href*="wa.me"]');if(a&&!a.dataset.noauto)track('whatsapp_click',{source:a.dataset.src||'desconhecido'})},true);
}
