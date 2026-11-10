/* components/Toast/toast.client.js — lógica do cliente (vanilla JS, ES module) */
import { openSheet } from '../CartSheet/cart-sheet.client.js';
import { $ } from '../../lib/utils.js';
import { wa } from '../../lib/whatsapp.js';

export let tt;

export function toastMsg(html){var t=$('#toast');t.innerHTML=html;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},4200)}

export function toast(nome,src){toastMsg('<b>'+nome+'</b> no seu pedido ↓ <a data-src="'+(src||'menu_item')+'" target="_blank" rel="noopener" href="'+wa('Olá, Bruno! Vim pelo site e quero uma pizza de '+nome+' 🍕')+'">ou pedir só essa no WhatsApp</a>')}

export function init(){
/* ================= Toast ================= */
 tt;
$('#toast').addEventListener('click',function(e){if(e.target.closest('[data-open-cart]')){$('#toast').classList.remove('show');openSheet()}});
}
