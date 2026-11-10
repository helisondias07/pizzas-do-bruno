/* Catálogo de ingredientes (id → nome), derivado do cardápio. Útil para conferir desenhos do motor. */
import { CARDAPIO } from './menu.js';
import { LANCAMENTO } from './launch.js';
export const INGREDIENTES = (() => {
  const m = {};
  [...CARDAPIO.salgadas, ...CARDAPIO.doces, LANCAMENTO].forEach((f) => (f.itens || []).forEach((i) => { if (!m[i.id]) m[i.id] = i.nome; }));
  return m;
})();
