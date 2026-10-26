# T17 — Verificação responsiva

Data: 26/10/2026

## Método

- Chrome 155 headless via DevTools Protocol.
- Estado de sucesso renderizado com os dados de exemplo do AC-02.
- Medições de layout coletadas em cada viewport.
- Verificação adicional com nome de cidade longo em 320 px.
- Verificação de zoom equivalente a 200% (viewport CSS de 640 px a partir de 1280 px).

## Resultados

| Viewport | Card | Colunas do card | Sidebar | Métricas | Temp. | Busca | Overflow horizontal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 320 px | 288 px | 1 coluna | topo, borda inferior 1 px | 1 coluna, tiles horizontais | 52 px | 52 px | Não (`scrollWidth` 320) |
| 360 px | 328 px | 1 coluna | topo, borda inferior 1 px | 1 coluna, tiles horizontais | 52 px | 52 px | Não (`scrollWidth` 360) |
| 380 px | 348 px | 1 coluna | topo, borda inferior 1 px | 1 coluna, tiles horizontais | 52 px | 52 px | Não (`scrollWidth` 380) |
| 560 px | 528 px | 1 coluna | topo, borda inferior 1 px | 1 coluna, tiles horizontais | 52 px | 52 px | Não (`scrollWidth` 560) |
| 720 px | 672 px | 1 coluna | topo, borda inferior 1 px | 2 colunas | 64 px | 56 px | Não (`scrollWidth` 720) |
| 768 px | 720 px | `280px 440px` | lateral, borda direita 1 px | 2 colunas | 64 px | 56 px | Não (`scrollWidth` 768) |
| 1280 px | 800 px | `280px 520px` | lateral, borda direita 1 px | 2 colunas | 64 px | 56 px | Não (`scrollWidth` 1280) |

## Verificações complementares

- Em 560 px: `border-radius` do cartão = 22 px, padding da página = `24px 16px`, métricas em uma coluna e tiles em layout horizontal.
- Em 720 px: sidebar sem borda direita, com borda inferior, e cartão em uma coluna.
- Em 768 px: layout permanece em duas colunas.
- Em 380 px: botão mantém o texto “Buscar” visível (68,7 px de largura), sem overflow.
- Nome longo em 320 px: quebra em 4 linhas (112 px de altura), sem overflow horizontal e sem texto excedendo os containers.
- Área principal: `overflow-y: visible`, `scrollHeight` igual a `clientHeight` em todos os viewports.
- Zoom de 200% (640 px CSS): sem overflow horizontal, conteúdo acessível em uma coluna.

Screenshots de 320, 360, 380, 560, 720, 768, 1280, cidade longa em 320 e zoom 200% foram capturados durante a inspeção.
