# Pizzas do Bruno — como o projeto funciona

Landing do **Bruno's Pizza** (`@pizzasdobruno`). A pessoa monta a pizza na tela — inteira ou meio a meio, com ou sem borda — e o pedido sai **pronto na mensagem do WhatsApp** do Bruno (`wa.me/5522981048508`). Não há pagamento, login nem backend.

Produção: https://pizzas-do-bruno.vercel.app (`main`). O visual novo do montador fica na branch `feat/pizza-design-v2` e só entra em produção quando for aprovado.

## Stack

- **[Astro](https://astro.build) 7**, saída **estática**. O HTML do cardápio, dos reels e das avaliações já sai pronto do build (bom para SEO).
- Comportamento no navegador em **JavaScript puro** (ES modules). Sem React e sem dependência de runtime.
- Pizza, caixa e ingredientes são **SVG** desenhado na hora (Web Animations API + um morph SMIL no queijo). Não há sprite sheet de fotos.
- Node 20 ou mais novo.

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # gera dist/
npm run preview   # serve dist/ como em produção
```

Atalhos na URL: `?estado=aberto` ou `?estado=fechado` força o status do forno. `?shot` desliga as animações de entrada da página (útil para print). `prefers-reduced-motion: reduce` faz o motor da pizza ir direto ao quadro final.

## Mapa da página

`src/pages/index.astro` só empilha os componentes, nesta ordem:

1. **Header** — marca e atalho para montar.
2. **Hero** — chamada principal. O botão muda o texto conforme o forno está aceso ou apagado.
3. **Ribbon** — faixa de destaque.
4. **Launch** — lançamento da semana (`src/data/launch.js`). `ativo: false` esconde a seção.
5. **Reels** — prévias do Instagram. O arquivo `reels.json` é rebuscado em produção.
6. **About** — história da casa.
7. **Featured** — um sabor em destaque.
8. **Menu** — cardápio salgado e doce, gerado do `menu.json`.
9. **Oven** — “forno aceso / apagado”, com horário de Brasília.
10. **Builder** — “Monte a sua pizza”. É o coração do site (pizza SVG, sabores, ingredientes, borda, sacola e WhatsApp).
11. **Delivery** — bairros e taxas.
12. **Reviews** — avaliações (hoje são exemplos).
13. **Final** + **Footer**.
14. Por cima da página: toast do forno, seletor de sabor, sacola, barra de baixo, modal de endereço e toast.

`src/scripts/main.js` liga cada pedaço **nessa mesma ordem**. O estado compartilhado mora em `src/lib/state.js` (`S.order`, `S.coca`, `S.loc`, `S.step`).

Cada componente tem a pasta `src/components/<Nome>/` com markup (`.astro`), CSS e, quando precisa reagir ao clique, um `*.client.js`. O `BaseLayout` importa os CSS numa ordem fixa — essa ordem é a cascata. Um componente novo entra nessa lista.

## Do clique ao WhatsApp

1. A pessoa escolhe o sabor no seletor, numa “mais pedida” ou no cardápio. `builder.client.js` guarda o sabor atual em `cur` (`mode`, `a`, `b`, `borda`, `remA`, `remB`).
2. `PizzaViz.set` redesenha a pizza. Ingredientes com `fixo: false` podem ser desligados; o preço não muda. A mensagem leva “sem cebola”, etc.
3. **+ Adicionar ao pedido** coloca a pizza em `S.order`. Meio a meio cobra o **maior** dos dois preços (combinado como padrão de mercado — ainda falta o Bruno confirmar). Borda recheada soma `bordaPreco` (R$ 10). Coca 1,5 L soma `cocaPreco` (R$ 11).
4. Entrega pede bairro (taxa em `src/data/bairros.js`, hoje exemplos) e, no passo final, endereço. O mapa (Leaflet, em `public/vendor/leaflet`) só baixa quando a pessoa abre o mapa. Retirada não tem taxa.
5. `src/lib/whatsapp.js` monta o texto e abre `wa.me`. No celular o link abre na mesma aba, para o app do WhatsApp não deixar uma aba órfã. Fora do horário (qui–sáb, 18h–23h, `America/Sao_Paulo`) a mensagem sai como pedido agendado.
6. O último pedido fica só neste aparelho (`localStorage`, chave `brunos:ultimo-pedido`) e reaparece em “pedir de novo”.

Sons são sintetizados (`sound-engine.js`) e só carregam depois do primeiro toque. Dá para silenciar.

## Onde editar o dia a dia

| Quero mudar… | Arquivo |
|---|---|
| Preço, nome ou ingredientes de um sabor | `src/data/menu.json` |
| Lançamento da semana | `src/data/launch.js` |
| Bairros e taxas | `src/data/bairros.js` |
| WhatsApp, horário, preço da borda e da Coca | `src/data/config.js` |
| Atalhos “mais pedidas” | `src/data/mais-pedidas.js` |
| Reels | `src/data/reels.json` |
| Desenho de um ingrediente | `src/lib/pizza-engine-sprites.js` e a tabela `T` em `src/lib/pizza-engine.js` |

`src/data/ingredients.js` só junta `id → nome` a partir do cardápio, para conferência. Não desenha nada.

## O montador (“Monte sua pizza”)

Arquivos: `src/components/Builder/` e `src/lib/pizza-engine.js`, `pizza-engine-sprites.js`, `pack-animation.js`.

- **Inteira** usa o sabor A na pizza toda. **Meio a meio** divide no diâmetro: A na esquerda, B na direita, com um tracejado no meio.
- A lista de ingredientes debaixo da pizza é gerada dos `itens` do sabor. Tocar num chip chama `viz.toggle`, que anima só aquele ingrediente para dentro ou para fora.
- Se a pizza já está na caixa e o sabor, a borda ou um ingrediente muda, a pizza **sai da caixa**, atualiza e pode voltar (`BoxStage.slideOut` em `builder.client.js`).
- Quando a montagem assenta (`onSettled`), a pizza é cortada em 8 **sem separar as fatias**, desliza para uma caixa aberta com vapor. **+ Adicionar ao pedido** fecha a tampa em 3D, com o logo vermelho, `@pizzasdobruno` e o telefone. `prefers-reduced-motion` corta o movimento e não impede um novo pedido.
- As miniaturas (mais pedidas, seletor, campo do montador) são a **mesma pizza** no estado final, rasterizada uma vez num canvas pequeno (`PizzaViz.thumb`). São círculos (`aspect-ratio: 1/1`).

## Sistema de ingredientes

Tudo é vetor. Foto recortada foi considerada e deixada de lado: o motor já reaproveita um `<symbol>` por desenho via `<use>`, então caprichar o vetor não multiplica nó no DOM e continua leve no celular. Não há pipeline de imagem por ingrediente.

### 1. Dados

Cada sabor em `menu.json` tem `itens[]` com `id`, `nome` e `fixo`.

```json
{ "id": "azeitona", "nome": "Azeitona", "fixo": false }
```

`fixo: true` é base (molho, mussarela, chocolate). Não sai da pizza e o chip fica desabilitado. O `id` é a chave de tudo: desenho, quantidade, animação e o texto “sem …”.

### 2. Dois jeitos de desenhar

**Camadas especiais** (desenhadas no `into` do motor, não como pecinha repetida):

| id | O que aparece |
|---|---|
| `molho`, `choco`, `nutella`, `pistachecreme` | Disco + espiral desenhada com `stroke-dashoffset`. Molho de tomate leva textura (`feTurbulence` uma vez só). |
| `chocobranco` | Camada cremosa com cristas de espátula, gotas de caramelo e “nevada” de raspas (`#t-raspa`) que caem e pousam. |
| `queijo` | Mussarela que **derrete**: um blob pequeno faz morph (SMIL) até uma borda irregular. Cor de marfim no miolo (`#FFF9EE` → dourado só na beira), manchas de forno por fatia, bolhas com brilho e um filete quente na borda. O clip da pizza (`RCLIP` 176) deixa o queijo escorrer um pouco sobre a massa; as coberturas continuam no miolo (`RCH` 147). |
| `catupiry` | Poças e redemoinhos **por cima** das outras coberturas (a bisnaga vai no final). Uma poça grande por fatia, outra menor, e um redemoinho gordo e curto. Cada poça tem sombra, miolo claro e a espiral da bisnaga. Não é mais um fio branco atravessando a pizza. |
| `oregano` | Flocos (caminhos em `ORE` / cores em `ORC`), espalhados numa grade polar com um tremor estável. |
| `barbecue` e um segundo molho doce | Fios ondulados (`drawLines`). |

**Pecinhas** (tudo o que está na tabela `T` de `pizza-engine.js`, menos o catupiry, que é especial): cada uma é um `<symbol>` 28×28 em `pizza-engine-sprites.js`, reutilizado com `<use>`. O desenho pode ser uma string ou uma lista de variações; o motor alterna entre elas. Formas orgânicas (frango desfiado, cebola, lascas) nascem de uma semente fixa: sempre iguais, sempre irregulares.

A tabela `T` diz, para cada id:

- `R0` — raio do desenho dentro do símbolo.
- `TR` — raio na pizza (o viewBox da pizza é 400×400, centro 200).
- `N` — quantidade na pizza inteira (metade leva cerca de metade).
- `rot` — a peça pode girar.
- `fine` — miúdo (milho, orégano, granulado…): cai mais rápido e junto.
- `herb` — erva, entra depois do catupiry.

`cls()` ordena a montagem: molho → queijo → coberturas grandes → médias → **catupiry** → orégano e ervas → fio extra (barbecue / segundo molho doce).

Se as peças grandes não couberem em ~60% da área, `fit` reduz a quantidade de forma proporcional. O mesmo sabor gera sempre a mesma pizza (`hash(nome + metade)`).

### 3. Distribuição nas 8 fatias

Os cortes nascem em 12h. `sliceAngles` devolve o centro de cada fatia (8 na inteira, 4 em cada metade).

- `rings` (calabresa, frango, presunto, lombo…): 1, 2 ou 3 anéis, sempre um múltiplo do número de fatias. O segundo anel fica um pouco defasado, ainda dentro da fatia, para não empilhar em cima do primeiro.
- `ring` / `radial` (azeitona, ovo, tomate, cebola, pimentão, manjericão…): um anel. `RING_POS` separa os raios para ovo e azeitona não caírem no mesmo ponto. Se o anel bater em algo que já está na pizza, tenta um raio vizinho.
- `sprinkle` (orégano, milho, granulado, coco…): grade polar, com um jitter pequeno vindo da semente. Se faltar peça, completa com espiral de Vogel sem aleatório extra.

Depois do ponto calculado, cada peça ganha um empurrão estável de até ~14 px (miúdos, ~5 px) e um giro extra de alguns graus. Continua uma por fatia, sem cara de relógio.

`fits` impede peça no meio do corte do meio a meio e impede o centro de sair da área do queijo.

### 4. Animação

`anim()` usa a Web Animations API. Com `prefers-reduced-motion` (lido uma vez no carregamento) ela aplica só o último quadro e devolve uma Promise já resolvida. Por isso miniatura, `?shot` não entra aqui — a miniatura força `reduce = true` só enquanto rasteriza.

- **Molho:** a espiral “se desenha”; o disco aparece no fim.
- **Queijo:** o caminho cresce do centro até a borda irregular; manchas, bolhas e brilhos surgem em seguida. No modo reduzido o caminho já nasce grande.
- **Pecinhas e catupiry:** cada uma começa fora da fatia (um pouco para fora do centro e para cima), girando, e pousa com um quique curto. A direção usa o `translate` do grupo pai, então a peça cai **no lugar dela**, não num eixo genérico. Miúdos caem mais juntos (`sprinkle` no som). Peças grandes fazem no máximo 7 “toques”, espaçados, para não virar metralhadora.
- **Tirar um ingrediente:** as peças sobem espalhadas, girando e encolhendo; fios (barbecue etc.) somem junto. O grupo some de verdade depois da animação, e um `gen` impede um toggle rápido de esconder a peça que já voltou.
- Trocar de sabor manda a camada antiga embora (`out`) e monta a nova.

A borda recheada é outra animação, em anel: a massa abre um sulco, o catupiry entra, a massa fecha e algumas pontas de creme ficam espiando. Não usa as poças do recheio de cima.

Sombras das pecinhas estão **dentro** do desenho (um caminho deslocado). Filtro SVG por peça foi evitado de propósito — no celular isso repinta caro. O único filtro pesado de textura é o do molho de tomate, uma vez.

### 5. Como adicionar um ingrediente

1. Usar um `id` curto, sem acento, em `menu.json` (e no lançamento, se for o caso), com `nome` e `fixo`.
2. Se for cobertura comum:
   - Desenhar em `pizza-engine-sprites.js`. O símbolo é viewBox `-14 -14 28 28`. Pode ser uma função com semente (variações) ou uma string SVG. Exportar em `SPR`.
   - Registrar em `T` (`pizza-engine.js`): `R0`, `TR`, `N` e, se fizer sentido, `rot`, `fine` ou `herb`.
   - Opcional: `LAYOUT` (`rings`, `ring`, `radial`, `sprinkle`) e `RING_POS` (`[raio 0–1, defasagem em radianos]`). Sem isso, cai em anéis.
3. Se for molho, queijo ou algo de uma camada só, tratar no `if` de `Viz.prototype.into` (ver `queijo`, `catupiry`, `SAUCE`). Aí não entra em `T` como pecinha — ou entra e é filtrado, como o catupiry.
4. Conferir inteira, meio a meio, tirar/colocar o chip e uma miniatura. O mesmo `id` tem de existir nos dois arquivos; um id sem desenho simplesmente não aparece na pizza.

## O que já foi feito

- `1592e39` — landing em Astro, estática e componentizada (base).
- `feat/ingredientes-realistas` → já **entrou em `main`** (`#1`, `ee35558`): sprites refeitos (frango desfiado, calabresa, cebola roxa, tomate cereja, catupiry de bisnaga no símbolo, etc.).
- `feat/pizza-design-v2` (PR aberto, **não misturar em `main`** ainda):
  - Miniaturas em círculo perfeito.
  - Coberturas em padrão de pizzaiolo, determinístico, em vez de espalhadas ao acaso.
  - Caixa: corte em 8 sem separar, caixa aberta com vapor, tampa 3D com logo vermelho; se algo muda, a pizza sai da caixa.
  - **Esta etapa:** mussarela menos chapada e menos amarela (derretido irregular, manchas e bolhas); catupiry em poças e redemoinhos por fatia, por cima do recheio, no lugar do fio branco; cada ingrediente cai espalhado na própria fatia e sai espalhado; tremor estável para não parecer relógio; `prefers-reduced-motion` continua valendo. A caixa, o pedido, o WhatsApp e o resto da página não foram mexidos.

## Limitações

- Continua ilustração vetorial. Não chega na foto do Instagram; o ganho foi cor, volume e o jeito de cair, sem pesar o celular com dezenas de PNG.
- Manchas de forno e poças são formas suaves, não uma foto de mussarela gratinada.
- Quantidade e posição são regras (anéis e fatias), não um gerador que imita cada pizza que o Bruno tira do forno.
- Bairros, avaliações, endereço de retirada, reels, GA4 e o preço do meio a meio ainda dependem do Bruno (lista no `README.md`).
- O modo reduzido é lido uma vez, quando o motor carrega. Mudar a preferência do sistema sem recarregar a página não troca o comportamento no meio da sessão.

## Deploy

A Vercel detecta Astro: build `npm run build`, saída `dist`. `SITE_URL` opcional para as tags OG. `vercel.json` só ajusta cache. Preview de branch não substitui a produção enquanto o PR não for mergeado — e este trabalho **não deve ser mergeado em `main`** até a aprovação.
