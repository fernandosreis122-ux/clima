# T19 — QA final e Definition of Done

Data: 26/10/2026

Status: **critérios verificados; aguardando aprovação visual final do usuário.**
A linha da T19 permanece `[ ]` em `.docs/tasks.md` até essa aprovação.

## Ambiente e método

- Windows, Node.js 24.13.1, npm 11.8.0.
- Build de produção servido por `npm.cmd run preview` em `http://127.0.0.1:4174/`.
- Chrome 155.0.8059.85 via DevTools Protocol, com respostas de exemplo da Open-Meteo interceptadas no limite de rede.
- Firefox 157.0 e WebKit 27.2 via Playwright, com o mesmo fluxo e respostas determinísticas.
- API real da Open-Meteo também foi consultada em smoke test no Chrome.
- Fuso do navegador dos testes cross-browser: `Asia/Tokyo`, para comprovar que a data/hora local da cidade não é deslocada.
- A árvore de acessibilidade do Chrome foi usada como equivalente mínimo de leitor de tela, conforme aceito na T18. Não há leitor de tela dedicado instalado no ambiente.
- Safari nativo não está disponível no Windows; WebKit 27.2 foi usado como equivalente de engine.

## Correções finais aplicadas

1. O loading passou a espelhar a estrutura final da sidebar e das métricas:
   - skeletons de data e horário de atualização;
   - skeletons de ícone, rótulo e valor em cada tile;
   - skeleton secundário no tile de vento.
2. As dimensões dos skeletons agora acompanham as dimensões reais em todos os breakpoints, eliminando layout shift.
3. Em `max-width: 360px`, o rótulo do terceiro tile de loading reserva duas linhas, acompanhando a quebra real de “Probabilidade de precipitação”.
4. O teste de loading foi atualizado de 10 para 20 skeletons e ganhou verificações dos novos elementos.
5. Nenhum texto, fluxo funcional ou contrato da aplicação foi alterado.

Arquivos alterados nesta task:

- `src/ui/render.ts`
- `src/ui/render.test.ts`
- `src/style.css`
- `.docs/qa/t19-final.md`

## AC-01 a AC-20

| AC | Verificação | Resultado |
| --- | --- | --- |
| AC-01 | Abertura inicial no Chrome/Firefox/WebKit: empty state, input vazio, zero requisições Open-Meteo. | Atendido |
| AC-02 | Fluxo real do app com os dados de exemplo: `19 °C`, `Rio de Janeiro, BR`, `Quarta-feira, 17 de junho`, `Atualizado às 09:45`, `Dia`, `Parcialmente nublado`, `Código WMO 2`, `92%`, `21,4 °C`, `73%`, `5,8 km/h`, `de O · 277°`. O loading aparece uma vez, com 20 skeletons e `aria-busy="true"`. | Atendido |
| AC-03 | Enter no input dispara geocodificação + forecast e renderiza sucesso em Chrome, Firefox e WebKit, como o botão. | Atendido |
| AC-04 | Query com espaços: nenhuma requisição, mensagem “Digite o nome de uma cidade.”, foco no input e conteúdo anterior preservado. | Atendido |
| AC-05 | Geocodificação vazia: “Cidade não encontrada”, nenhum forecast, nenhuma métrica, input com o texto e foco; seleção `0–9` em “Atlântida”. Sem retry. | Atendido |
| AC-06 | Cidade válida + forecast inválido: “Clima indisponível” com “Rio de Janeiro”, nenhuma métrica e “Tentar novamente”. | Atendido |
| AC-07 | Falha de rede simulada: “Não foi possível conectar”, nenhuma métrica e retry. | Atendido |
| AC-08 | Requisição mantida aberta: erro de conexão após 12.060 ms; input focado e botão “Buscar” novamente disponível. O abort também é coberto pelo teste unitário. | Atendido |
| AC-09 | Duas buscas rápidas: a segunda (“Segunda”) renderizou; a resposta antiga foi liberada depois e não alterou a tela. | Atendido |
| AC-10 | Retry reenviou `name=Rio+de+Janeiro`, exibiu loading, restaurou o input e renderizou o sucesso. | Atendido |
| AC-11 | Reload após sucesso: empty state, input vazio, nenhuma requisição Open-Meteo adicional, `localStorage` 0, `sessionStorage` 0, cookie vazio e URL `/`. | Atendido |
| AC-12 | Os 28 códigos WMO da tabela 7.8 têm teste de descrição, ícone de dia e ícone de noite; a variante noturna foi validada. | Atendido |
| AC-13 | Código 123 no navegador e códigos `-1`, `4`, `100`, `999` nos testes: “Condição desconhecida”, ícone `unknown` e código bruto. | Atendido |
| AC-14 | Números com vírgula, unidades corretas, data pt-BR capitalizada, 16 pontos cardeais e graus; data/hora mantidas com o navegador em `Asia/Tokyo`. | Atendido |
| AC-15 | 320, 360, 720, 768 e 1280 px sem scroll horizontal; 720 px empilha a sidebar; 768 px mantém duas colunas; 560 px empilha as métricas. | Atendido |
| AC-16 | Navegação por Tab/Shift+Tab, foco visível, label, erro associado, regiões live, `aria-busy`, retry e link acessíveis; detalhes na T18. | Atendido |
| AC-17 | Nome `<img src=x onerror="window.xss=1"> Cidade Muito Longa`: texto literal, nenhum elemento `img`, `window.xss` nulo. | Atendido |
| AC-18 | Rodapé “Dados meteorológicos por Open-Meteo” em empty, loading, sucesso e todos os erros; link `target="_blank"` e `rel="noopener noreferrer"`. | Atendido |
| AC-19 | `npm.cmd run build` concluiu sem erros de TypeScript. | Atendido |
| AC-20 | Inspeção estática: `fetch` apenas no serviço, nenhum storage/cookie, nenhum template demo, `strict: true`, sem dependências de runtime. | Atendido |

## Checklist da §14

### Funcional

- [x] Empty state inicial sem requisição.
- [x] Busca por Enter.
- [x] Busca pelo botão.
- [x] Query vazia exibe erro inline e não chama a API.
- [x] Query com espaços extras é normalizada.
- [x] Busca válida exibe loading único e depois sucesso.
- [x] Cidade inexistente exibe “Cidade não encontrada”.
- [x] Cidade encontrada + clima inválido exibe “Clima indisponível”.
- [x] Falha de rede exibe “Não foi possível conectar”.
- [x] Timeout exibe erro de conexão e permite nova busca.
- [x] Duas buscas rápidas: apenas a última renderiza.
- [x] Retry repete a query correta.
- [x] Nova busca substitui completamente o resultado anterior.
- [x] Recarregar a página volta ao empty state.
- [x] Nenhum dado é salvo em `localStorage`, `sessionStorage`, cookies ou URL.

### Dados e formatação

- [x] Temperatura principal arredondada.
- [x] Sensação térmica com 1 casa decimal.
- [x] Umidade e precipitação inteiras.
- [x] Vento com 1 casa decimal.
- [x] Direção cardinal de 16 pontos + graus.
- [x] Unidades vindas de `current_units`.
- [x] Data/hora da cidade corretas, inclusive em fuso diferente do navegador.
- [x] Todos os weather codes da tabela 7.8.
- [x] Weather code desconhecido não quebra a tela.
- [x] Dia/noite reflete `is_day`.

### Visual e responsivo

- [x] 320 px sem scroll horizontal.
- [x] 360 px sem scroll horizontal.
- [x] 768 px com layout de duas colunas.
- [x] 720 px com sidebar empilhada.
- [x] 1280 px com layout de duas colunas.
- [x] Nome de cidade longo não vaza do cartão.
- [x] Skeletons sem layout shift.
- [x] Empty, loading, sucesso e erros visualmente distintos.
- [x] Rodapé com atribuição em todos os estados.
- [x] Zoom de 200% sem perda de conteúdo.
- [x] `prefers-reduced-motion` desativa animações.

### Acessibilidade

- [x] Navegação completa por Tab/Shift+Tab.
- [x] Foco visível em todos os interativos.
- [x] Input com label acessível.
- [x] Erro inline associado via `aria-describedby`/`aria-invalid`.
- [x] Região `aria-live` anuncia loading, sucesso e erros.
- [x] `aria-busy` durante loading.
- [x] Ícones decorativos com `aria-hidden`.
- [x] Contraste AA verificado.
- [x] Informação não depende apenas de cor.
- [x] Leitor de tela consegue ler cidade, data, condição e métricas — verificado pela árvore AX do Chrome, com nomes acessíveis para `Rio de Janeiro, BR`, `Quarta-feira, 17 de junho`, `Parcialmente nublado`, `92%`, `21,4 °C`, `73%`, `5,8 km/h` e `de O · 277°`.
- [x] Link externo com `rel="noopener noreferrer"`.

### Técnico

- [x] `npm run build` sem erros.
- [x] `strict: true` habilitado.
- [x] Sem `any` em contratos públicos.
- [x] Nenhum `fetch` fora de `open-meteo.ts`.
- [x] Nenhum erro no console em fluxo normal.
- [x] Nenhum asset/template demo restante.
- [x] `lang="pt-BR"`, título e meta description corretos.
- [x] Favicon substituído.

## Layout e skeletons

Medições no build de produção, com loading e sucesso do mesmo fluxo:

| Viewport | Card loading/sucesso | Sidebar | Main | Tiles | Scroll horizontal |
| --- | --- | --- | --- | --- | --- |
| 320 px | 800 / 800 px | 362 px | 438 px | 80, 80, 96, 98 px | Não |
| 360 px | 800 / 800 px | 362 px | 438 px | 80, 80, 96, 98 px | Não |
| 380 px | 784 / 784 px | 362 px | 422 px | 80, 80, 80, 98 px | Não |
| 560 px | 784 / 784 px | 362 px | 422 px | 80, 80, 80, 98 px | Não |
| 720 px | 776 / 776 px | 374 px | 402 px | 154, 154, 184, 184 px | Não |
| 768 px | 420 / 420 px | 420 px | 420 px | 154, 154, 184, 184 px | Não |
| 1280 px | 420 / 420 px | 420 px | 420 px | 154, 154, 184, 184 px | Não |

- Em 768 px: `grid-template-columns: 280px 440px`, sidebar com borda direita.
- Em 720 px: uma coluna, `672px`, sidebar com borda inferior.
- Em 560 px: métricas em uma coluna.
- Em 320 px, empty, loading, sucesso, cidade não encontrada, clima indisponível e erro de rede permanecem com `scrollWidth` 320.
- Firefox e WebKit reproduziram a mesma estrutura; no WebKit houve apenas arredondamento subpixel (≈419,99997 px) nas alturas.

## API real

Smoke test no Chrome, sem interceptação:

- Geocodificação: HTTP 200, `application/json`.
- Forecast: HTTP 200, `application/json`.
- Cidade: `Rio de Janeiro, BR`.
- Dados atuais renderizados: `22 °C`, `Segunda-feira, 26 de outubro`, `Atualizado às 17:00`, `Nublado`, `Código WMO 3`, `74%`, `20,5 °C`, `85%`, `23,3 km/h`, `de SO · 218°`.
- Nenhum erro de console ou de página.

Os valores exatos do AC-02 foram comprovados com as respostas de exemplo do PRD; a API real permanece funcional e retorna dados atuais, naturalmente diferentes do fixture.

## Portões e inspeção estática

- `npm.cmd run test`: 9 arquivos, **302/302 testes**.
- `npm.cmd run build`: concluído; `dist` gerado com 15 módulos, sem backend.
- `npm.cmd run preview`: `/`, `/favicon.svg`, JS e CSS responderam HTTP 200.
- Chrome normal: 0 erros de console; Firefox e WebKit: 0 erros de console e 0 `pageerror`.
- O único erro de console observado foi `net::ERR_FAILED`, causado deliberadamente ao simular falha de rede.
- `fetch`: somente `src/services/open-meteo.ts:95`.
- `localStorage`/`sessionStorage`/cookies/IndexedDB: nenhuma ocorrência no produto.
- `innerHTML`: apenas uma asserção de teste; nenhuma renderização do produto usa HTML dinâmico.
- `any`: apenas `expect.any(AbortSignal)` em testes; nenhum contrato público.
- `strict: true` em `tsconfig.json`.
- `package.json`: sem dependências de runtime; apenas `jsdom`, `typescript`, `vite` e `vitest` em `devDependencies`.
- `public/` contém somente `favicon.svg`; `dist/` contém HTML, favicon, CSS e JS estáticos.
- Nenhum resquício de Vite, logo ou template demo em `index.html`/`dist`.
- Sem `setInterval`, geolocalização, autocomplete de resultados, analytics, polling ou retry automático.
- `cache: 'no-store'`, `Accept: application/json` e `AbortSignal` presentes no serviço.
- Separação mantida: `open-meteo.ts` (HTTP), `weather-lookup.ts` (orquestração), `AppState` (estado), `controller.ts` (fluxo).

## Definition of Done — §16

### Produto

- [x] Todos os requisitos Must implementados.
- [x] Todos os estados da §7.11 implementados.
- [x] Erros distintos, com mensagens e ações corretas.
- [x] Nenhum dado meteorológico parcial em tela.
- [x] Weather codes completos conforme a tabela 7.8.
- [x] Formatação pt-BR e unidades corretas.
- [x] Atribuição à Open-Meteo.

### Técnico (entrega)

- [x] TypeScript estrito, sem `any` em contratos.
- [x] Todas as chamadas Open-Meteo em `src/services/open-meteo.ts`.
- [x] Orquestração separada em `weather-lookup.ts`.
- [x] Estado dirigido por `AppState`.
- [x] Timeout, abort e proteção contra respostas fora de ordem.
- [x] Renderização segura contra XSS.
- [x] Sem persistência, cache de aplicação, polling ou retry automático.
- [x] `npm run build` passa.
- [x] Sem erros no console em fluxo normal.
- [x] Template Vite removido.

### Visual

- [x] Tokens da §11.4 aplicados.
- [x] Layout desktop e mobile conforme diagramas.
- [x] Empty, loading, sucesso e erros conforme especificação.
- [x] SVG inline, sem emojis ou bibliotecas de ícones.
- [x] Foco visível e `prefers-reduced-motion`.
- [x] Contraste AA.
- [x] Sem scroll horizontal em 320 px.

### QA

- [x] Checklist da §14 concluído.
- [x] Critérios de aceite da §12 validados.
- [x] Teste com dados de exemplo (Rio de Janeiro).
- [x] Teste em Chrome, Firefox e Safari (WebKit como equivalente de Safari).
- [x] Teste com leitor de tela em pelo menos um fluxo (busca + erro): validação pela árvore AX do Chrome, equivalente mínimo adotado na T18; fluxo de sucesso também validado com cidade, data, condição e métricas legíveis.

## Limitações registradas

- Não há leitor de tela dedicado disponível; a validação foi feita pela árvore de acessibilidade do Chrome, incluindo regiões live, labels e nomes acessíveis.
- Safari nativo não está instalado no Windows; WebKit 27.2 foi usado como equivalente.
- Os valores do AC-02 são um fixture determinístico do PRD. A API real está acessível e foi validada separadamente com dados atuais.

## Pendência

- Aprovação visual final do usuário em `http://127.0.0.1:4174/`.
- Após a aprovação, marcar `T19` como concluída em `.docs/tasks.md`.
