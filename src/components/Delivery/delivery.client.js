/* components/Delivery/delivery.client.js — lógica do cliente (vanilla JS, ES module) */
import { bs } from '../AddressModal/address-modal.client.js';
import { setTipo } from '../DeliveryChoice/delivery-choice.client.js';
import { BAIRROS } from '../../data/index.js';
import { info } from '../../lib/cart-store.js';
import { $, brl, reduce } from '../../lib/utils.js';
import { wa } from '../../lib/whatsapp.js';

export let norm;

export function check(){var q=norm($('#bairroIn').value),out=$('#areaOut');if(!q){out.innerHTML='';return}
  var b=BAIRROS.filter(function(x){return norm(x.nome)===q})[0]||BAIRROS.filter(function(x){return norm(x.nome).indexOf(q)>-1})[0];
  if(b&&b.atende){out.className='area-out ok';out.innerHTML='<b>✓ Entregamos em '+b.nome+'</b><span>Taxa de entrega: '+brl(b.taxa)+'</span><button type="button" id="useBairro">Usar no meu pedido</button>';
    $('#useBairro').onclick=function(){$('#bairroWrap').hidden=false;bs.value=b.nome;info.bairro=b.nome;setTipo('entrega');$('#montar').scrollIntoView({behavior:reduce?'auto':'smooth'})}}
  else if(b){out.className='area-out no';out.innerHTML='<b>Ainda não entregamos em '+b.nome+'</b><span>Mas dá pra retirar! Ou chame no WhatsApp pra combinar.</span>'}
  else{out.className='area-out no';out.innerHTML='<b>Não encontramos esse bairro</b><span><a data-src="area" target="_blank" rel="noopener" href="'+wa('Olá, Bruno! Vocês entregam no bairro '+$('#bairroIn').value+'?')+'">Pergunte no WhatsApp →</a></span>'}
  if(!reduce)out.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'})}

export function init(){
/* ================= 5) ÁREA DE ENTREGA ================= */
 norm=function(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()};
$('#bairroList').innerHTML=BAIRROS.map(function(b){return '<option value="'+b.nome+'">'}).join('');
$('#areaForm').onsubmit=function(e){e.preventDefault();check()};
}
