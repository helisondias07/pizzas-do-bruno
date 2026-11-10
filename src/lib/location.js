/* lib/location.js — lógica do cliente (vanilla JS, ES module) */
import { S } from './state.js';
import { renderOrder } from '../components/OrderPanel/order-panel.client.js';
import { $, BASE, buzz } from './utils.js';

export let LFp, map, mk, PIN;

export function loadLeaflet(){if(LFp)return LFp;LFp=new Promise(function(res,rej){var c=document.createElement('link');c.rel='stylesheet';c.href=BASE+'vendor/leaflet/leaflet.css';document.head.appendChild(c);
  var s=document.createElement('script');s.src=BASE+'vendor/leaflet/leaflet.js';s.async=true;s.onload=function(){res(window.L)};s.onerror=function(){LFp=null;rej(new Error('leaflet'))};document.head.appendChild(s)});return LFp}

export function locMsg(cls,html){var st=$('#locSt');st.className='loc-st'+(cls?' '+cls:'');st.innerHTML=html}

export function setLoc(lat,lng,acc,src){S.loc={lat:+(+lat).toFixed(6),lng:+(+lng).toFixed(6)};
  locMsg('ok','✓ Localização adicionada ao pedido'+(src==='pin'?' (pino ajustado)':acc?' · precisão de ~'+Math.max(5,Math.round(acc))+' m':'')+'. <button type="button" id="locRm">Remover</button>');
  $('#locRm').onclick=clearLoc;var b=$('#locBtn');b.classList.add('ok');b.querySelector('span').textContent='Atualizar localização';renderOrder()}

export function clearLoc(){S.loc=null;locMsg('','');$('#locMap').hidden=true;var b=$('#locBtn');b.classList.remove('ok');b.querySelector('span').textContent='Usar minha localização';renderOrder();b.focus()}

export function locFail(m){locMsg('err',m);var e=$('#fRua');if(e&&!e.value)e.focus()}

export function showMap(){var box=$('#locMap');box.hidden=false;
  loadLeaflet().then(function(Lf){if(!map){map=Lf.map(box,{zoomControl:false,scrollWheelZoom:false}).setView([S.loc.lat,S.loc.lng],17);
      Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);Lf.control.zoom({position:'bottomright'}).addTo(map);map.attributionControl.setPrefix('Leaflet');
      mk=Lf.marker([S.loc.lat,S.loc.lng],{draggable:true,autoPan:true,title:'Arraste para ajustar',alt:'Sua localização',icon:Lf.divIcon({className:'pin',html:PIN,iconSize:[34,44],iconAnchor:[17,42]})}).addTo(map);
      mk.on('dragend',function(){var q=mk.getLatLng();setLoc(q.lat,q.lng,null,'pin')});
      map.on('click',function(ev){mk.setLatLng(ev.latlng);setLoc(ev.latlng.lat,ev.latlng.lng,null,'pin')});
      box.insertAdjacentHTML('beforeend','<span class="lm-hint">Arraste o pino se precisar</span>')}
    else{map.setView([S.loc.lat,S.loc.lng],17);mk.setLatLng([S.loc.lat,S.loc.lng])}
    setTimeout(function(){map.invalidateSize()},60)}).catch(function(){box.hidden=true})}

export function init(){
/* ================= LOCALIZAÇÃO (só ao tocar; Leaflet + OSM carregados sob demanda) ================= */
 LFp=null,map=null,mk=null;
 PIN='<svg viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43s15-14.3 15-26A15 15 0 0 0 2 17c0 11.7 15 26 15 26z" fill="#D0242B"/><circle cx="17" cy="17" r="6" fill="#fff"/></svg>';
window.__showMap=showMap;
$('#locBtn').onclick=function(){var b=this;
  if(!navigator.geolocation||window.isSecureContext===false){locFail('Seu navegador não liberou a localização. Preencha a rua e um ponto de referência, que já resolve.');return}
  b.setAttribute('aria-busy','true');locMsg('','Buscando sua localização…');track('location_request',{});
  navigator.geolocation.getCurrentPosition(function(p){b.removeAttribute('aria-busy');setLoc(p.coords.latitude,p.coords.longitude,p.coords.accuracy,'gps');showMap();buzz();track('location_ok',{})},
    function(err){b.removeAttribute('aria-busy');track('location_fail',{code:err&&err.code});
      locFail(err&&err.code===1?'Sem permissão de localização. Tudo bem: preencha a rua e um ponto de referência.':'Não conseguimos achar sua localização agora. Preencha a rua e um ponto de referência.')},
    {enableHighAccuracy:true,timeout:12000,maximumAge:60000})};
}
