/* components/AddressModal/address-modal.client.js — lógica do cliente (vanilla JS, ES module) */
import { renderSheet, setStep } from '../CartSheet/cart-sheet.client.js';
import { renderOrder } from '../OrderPanel/order-panel.client.js';
import { BAIRROS } from '../../data/index.js';
import { addrLine, doSend, savedAddr } from '../../lib/address.js';
import { info } from '../../lib/cart-store.js';
import { $, brl } from '../../lib/utils.js';

export let bs;

export function toForm(){info.addrSrc='form';info.bairro=$('#bairro').value;renderOrder();setStep('form')}

export function init(){
 bs=$('#bairro');
bs.innerHTML='<option value="">Selecione o bairro…</option>'+BAIRROS.map(function(b){return '<option value="'+b.nome+'">'+b.nome+(b.atende?' — taxa '+brl(b.taxa):' — não atendido')+'</option>'}).join('')+'<option value="__outro">Outro bairro</option>';
bs.onchange=function(){info.bairro=this.value;renderOrder()};
}

export function init2(){
$('#askYes').addEventListener('click',function(e){var sv=savedAddr();
  if(sv){e.preventDefault();info.addr=sv;info.addrSrc='saved';info.bairro=sv.bairro;$('#cfAddr').textContent=addrLine(sv)+'?';
    $('#cfExtra').textContent=[sv.ref?'Referência: '+sv.ref:'',sv.lat!=null?'Com localização no mapa':''].filter(Boolean).join(' · ');renderOrder();setStep('confirm');return}
  info.addr=null;info.addrSrc='cadastrado';doSend(e,this)});
$('#askNo').onclick=toForm;
$('#cfYes').addEventListener('click',function(e){doSend(e,this)});
$('#cfOther').onclick=toForm;
$('#fSN').addEventListener('change',function(){var n=$('#fNum');n.disabled=this.checked;if(this.checked)n.value='';n.setAttribute('aria-disabled',this.checked);renderSheet()});
['#fRua','#fNum','#fComp','#fRef'].forEach(function(s){$(s).addEventListener('input',function(){renderSheet()})});
}
