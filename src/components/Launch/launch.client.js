/* components/Launch/launch.client.js — lógica do cliente (vanilla JS, ES module) */
import { pick } from '../Builder/builder.client.js';
import { L } from '../../lib/catalog.js';
import { $ } from '../../lib/utils.js';
import { wa } from '../../lib/whatsapp.js';

export let li;

export function init(){
/* ================= 3) LANÇAMENTO ================= */
if(L&&L.ativo){$('#lancNome').textContent=L.nome;$('#lancDesc').textContent=L.descricao;$('#lancPreco').textContent=L.preco==null?'Valor: consulte':'R$ '+L.preco; li=$('#lancImg');if(L.srcset){li.srcset=L.srcset;li.sizes='(min-width:980px) 50vw, 100vw'}li.src=L.img;
  $('#lancAdd').onclick=function(){pick(L.nome,'launch')};$('#lancWa').href=wa('Olá, Bruno! Vi o lançamento '+L.nome+' no site. Qual o valor? 🍕')}else $('#lancamento').remove();
}
