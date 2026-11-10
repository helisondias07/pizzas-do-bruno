/* Cardápio (fonte: cardapio.json). `itens` = ingredientes explícitos por sabor,
   extraídos da descrição; fixo:true = não removível (base do sabor).
   Cada `id` de ingrediente precisa ter um desenho no motor (src/lib/pizza-engine.js). */
import menu from './menu.json';
export const CARDAPIO = menu;
