# Bruno's Pizza — landing (@pizzasdobruno)

Site vitrine do Bruno's Pizza. O cliente monta a pizza (inteira ou meio a meio, com ou sem borda) e o pedido sai **pronto no WhatsApp** do Bruno (`wa.me/5522981048508`). Não tem pagamento, backend nem cadastro.

Feito com **[Astro](https://astro.build)** em saída **estática**. O HTML sai pronto do build, inclusive cardápio, reels e avaliações (bom para SEO). O comportamento no navegador é **JavaScript puro em ES modules**, sem React e sem dependências de runtime.

## Rodar localmente

```bash
npm ci            # ou npm install
npm run dev       # http://localhost:4321  (recarrega ao salvar)
npm run build     # gera dist/
npm run preview   # serve dist/ como em produção
```

Precisa de Node 20 ou mais novo.

## Estrutura

```
src/
  pages/index.astro         página única: só compõe os componentes, na ordem da tela
  pages/404.astro           página 404
  layouts/BaseLayout.astro  <head> (SEO/OG, preload de fontes), estilos globais, tracking
  components/<Nome>/
    <Nome>.astro            markup do componente
    <Nome>.css              estilos do componente
    *.client.js             comportamento no navegador (quando existe)
      Header, SoundToggle, Hero, Ribbon, Launch, Reels, About, Featured, Menu (+MenuItem),
      Oven, Builder (+BordaOption), MaisPedidas, Reorder, OrderPanel (OrderList/OrderTotals),
      DeliveryChoice, Delivery, Reviews, Final, Footer, OvenToast, FlavorPicker,
      CartSheet (+CartBackdrop), AddressModal, BottomBar, Toast, SvgSprite
  lib/                      lógica compartilhada
    pizza-engine.js         motor da pizza SVG (montagem animada + miniaturas)
    sound-engine.js         sons sintetizados (Web Audio); carregado só após o 1º toque
    sound.js                preferência de som, destravar áudio, lareira
    whatsapp.js             monta a mensagem e os links wa.me
    hours.js                aberto/fechado (qui–sáb, 18h–23h, America/Sao_Paulo)
    cart-store.js           pedido, preços, taxa, totais, "pedir de novo"
    address.js, location.js endereço salvo, geolocalização + mapa (Leaflet sob demanda)
    catalog.js, analytics.js, motion.js, utils.js, state.js, reels-markup.js
  data/                     conteúdo editável
    menu.json               cardápio (sabores, preços, ingredientes)
    config.js               WhatsApp, horários, preço da borda e da Coca
    launch.js               lançamento da semana
    mais-pedidas.js, bairros.js, reviews.js, reels.json, ingredients.js
  styles/                   fonts.css, tokens.css (cores/espaços/movimento), global.css
  scripts/main.js           entrada única do cliente: inicializa cada parte em ordem
public/                     fontes, imagens, favicon, og-image, vendor/leaflet
scripts/fetch-reels.js      esboço: busca os reels do Instagram (Graph API) e gera reels.json
```

**Ordem do CSS.** Cada componente importa o próprio `.css`. O `BaseLayout` importa todos numa ordem fixa, que é a ordem da cascata. Mantenha essa lista se criar um componente novo.

### Testes manuais rápidos

- `?estado=aberto` ou `?estado=fechado` força o status do forno.
- `?shot` desliga as animações de entrada (útil para prints).

## Deploy

### Vercel (recomendado)

1. Importe o repositório na Vercel. O framework **Astro** é detectado sozinho; o build é `npm run build` e a saída é `dist`.
2. Opcional: defina `SITE_URL` (ex.: `https://pizzasdobruno.com.br`) para as tags OG. Sem ela, o build usa o domínio de produção da Vercel.

O `vercel.json` só define os headers de cache: `_astro` e fontes ficam imutáveis, imagens por 30 dias e `reels.json` sempre revalidado.

### GitHub Pages (em `https://<usuario>.github.io/pizzas-do-bruno/`)

O site precisa saber o subcaminho:

```bash
BASE_PATH=/pizzas-do-bruno/ SITE_URL=https://<usuario>.github.io npm run build
```

Publique o conteúdo de `dist/`, por exemplo com uma GitHub Action (`actions/upload-pages-artifact` + `actions/deploy-pages`), passando essas duas variáveis no passo de build. Num domínio próprio na raiz, não use `BASE_PATH`.

## O que editar no dia a dia

| Quero mudar… | Arquivo |
|---|---|
| Preço ou ingrediente de um sabor | `src/data/menu.json` |
| Lançamento da semana | `src/data/launch.js` (`ativo: false` esconde a seção) |
| Bairros e taxas | `src/data/bairros.js` |
| Horário, WhatsApp, preço da borda e da Coca | `src/data/config.js` (e os textos fixos nos componentes) |
| Reels | `src/data/reels.json`, ou `dist/reels.json` em produção (o site rebusca esse arquivo) |

Um ingrediente novo precisa de um desenho no motor (`src/lib/pizza-engine.js`), com o mesmo `id` usado no `menu.json`.

## Pendências com o Bruno

- [ ] **Domínio final** (`SITE_URL`) para as tags OG/Twitter.
- [ ] **Endereço real** para retirada (rodapé: "endereço a confirmar").
- [ ] **Bairros e taxas reais**; os atuais são exemplos.
- [ ] **Avaliações reais** (prints do destaque "Avaliações"); as atuais são exemplos.
- [ ] **Reels**: ID e token do Instagram para o `scripts/fetch-reels.js`. Hoje são prévias estáticas.
- [ ] **GA4 / Meta Pixel**: IDs reais (bloco comentado no `BaseLayout.astro`).
- [ ] **Meio a meio**: confirmar que cobra o sabor de maior valor.
- [ ] **Lançamento** (Pistache c/ Nutella): ingredientes e preço; hoje aparece "consulte".
- [ ] **Mais pedidas**: confirmar quais sabores saem mais.
- [ ] Conferir os ingredientes da Mussarela e da Ferrero (a Ferrero está só com Nutella e amendoim).
