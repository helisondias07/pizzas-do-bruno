/* scripts/boot.js — lógica do cliente (vanilla JS, ES module) */
import { renderOrder } from '../components/OrderPanel/order-panel.client.js';

export function init(){
window.__ready=true;
renderOrder();
document.documentElement.classList.add('ready');
}
