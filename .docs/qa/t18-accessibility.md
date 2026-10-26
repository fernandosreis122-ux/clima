# T18 — Verificação de acessibilidade e movimento

Data: 26/10/2026

## Correções aplicadas

- Foco do botão de busca alterado de `--focus-on-dark` para `--focus`, garantindo contraste de 5,17:1 sobre o fundo claro do controle.
- Input de busca esticado verticalmente para uma área de toque de 44 px.
- Link de atribuição com `min-height: 44px` e padding horizontal para área de toque de 84×44 px.
- Transição de conteúdo adicionada: fade + `translateY(4px)` em 180 ms, somente com `prefers-reduced-motion: no-preference`.
- Com `prefers-reduced-motion: reduce`, transições, animação do conteúdo, pulso dos skeletons e rotação do spinner são desativados.

## Teclado e foco

Fluxo inicial:

1. `#city` — foco visível no contêiner da busca, outline `#93c5fd` de 2 px.
2. Botão “Buscar” — outline `#2563eb` de 2 px.
3. Link “Open-Meteo” — outline `#93c5fd` de 2 px.

Shift+Tab percorre a ordem inversa. No estado de erro de conexão, a ordem é: input → “Buscar” → “Tentar novamente” → “Open-Meteo”. Todos os interativos mantêm foco visível.

## Áreas de toque

| Elemento | 1280 px | 320 px |
| --- | --- | --- |
| Input | 417×44 px | 118×44 px |
| Botão “Buscar” | 81×44 px | 69×44 px |
| Botão “Tentar novamente” | 44 px de altura | — |
| Link “Open-Meteo” | 84×44 px | 84×44 px |

## Árvore de acessibilidade

Fluxo real validado com a árvore de acessibilidade do Chrome, interceptando uma requisição da Open-Meteo para inspecionar loading e erro de conexão.

- **Validação vazia:** `searchbox` com nome “Nome da cidade”, descrição “Digite o nome de uma cidade.” e `invalid: true`; `alert` com `live: assertive` e `atomic: true`.
- **Loading:** `main` com `busy: true`; card de skeleton com `aria-hidden="true"`; botão com nome “Buscando…” e `busy: true`; input e botão permanecem habilitados.
- **Erro de conexão:** heading “Não foi possível conectar”, botão “Tentar novamente”, status “Não foi possível conectar ao serviço de clima.”, sem sidebar ou métricas.
- **Região de status:** `role="status"`, `aria-live="polite"` e `aria-atomic="true"`.
- **Ícones:** todos os SVGs são decorativos com `aria-hidden="true"` e `focusable="false"`.
- **Informação não apenas por cor:** estados têm texto e ícone; dia/noite e direção do vento têm texto.

## Contraste

| Par | Contraste |
| --- | --- |
| Texto claro / fundo escuro | 7,74:1 |
| Texto secundário / superfície | 7,69:1 |
| Texto discreto / superfície | 4,97:1 |
| Texto discreto / superfície sutil | 4,68:1 |
| Erro inline / fundo escuro | 8,51:1 |
| Branco / botão de ação | 5,17:1 |
| Foco / superfície clara | 5,17:1 |
| Foco / fundo escuro | 9,16:1 |
| Dia / fundo do badge | 4,71:1 |
| Noite / fundo do badge | 7,07:1 |
| Aviso / fundo do aviso | 5,20:1 |
| Erro / fundo do erro | 6,05:1 |
| Ícone de ação / fundo suave | 4,69:1 |

## Movimento

| Propriedade | `no-preference` | `reduce` |
| --- | --- | --- |
| Spinner | `spinner-rotate` | `none` |
| Skeleton | `skeleton-pulse` | `none` |
| Conteúdo | `content-enter` 180 ms | `none` |
| Transição do botão | 180 ms | 0 s |

Com `reduce`, spinner, botão “Buscando…” e skeletons continuam visíveis, sem animação.

## Portões de qualidade

- `npm.cmd run test`: 302/302 testes passando.
- `npm.cmd run build`: passando.
