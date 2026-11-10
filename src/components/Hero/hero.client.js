/* components/Hero/hero.client.js — lógica do cliente (vanilla JS, ES module) */
import { goBuilder } from '../BottomBar/bottom-bar.client.js';
import { ST } from '../../lib/hours.js';
import { $ } from '../../lib/utils.js';

export function init(){
$('#heroCta').addEventListener('click',function(e){e.preventDefault();goBuilder(ST.open?'hero':'hero_fechado')});
}
