# Tasks — Implementação do Clima

Documento operacional para implementação progressiva do [PRD](./prd.md). O PRD é a **fonte de verdade**: esta lista não repete especificações, apenas divide o trabalho, aponta as seções aplicáveis e define critérios objetivos de aprovação.

| Campo | Valor |
| --- | --- |
| Base | [PRD](./prd.md) v1.0 |
| Estratégia | Uma task por vez, em ordem de dependência |
| Execução | Agentes de AI, com aprovação antes de avançar |
| Status | Pronto para execução |
| Última atualização | 26/10/2026 |

---

## Como usar

1. Execute **uma task por vez**, na ordem numérica (T01 → T19), somente quando todas as dependências estiverem marcadas como concluídas.
2. Leia as seções do PRD indicadas em **PRD** antes de implementar. Não invente requisitos fora dele.
3. Implemente apenas o escopo da task. Itens de tasks futuras não devem ser antecipados.
4. Ao final, execute os portões de qualidade e comprove cada critério de **Aprovação**.
5. Marque a linha `- [ ] **Txx concluída**` como `- [x]` **somente** após todos os critérios passarem. Os itens de **Aprovação** são critérios, não checkboxes; evidencie cada um no relatório.
6. Se houver ambiguidade, conflito com o PRD ou bloqueio externo, **pare e pergunte** antes de decidir.
7. No relatório final da task, informe: arquivos alterados, comandos executados, critérios comprovados e pendências.
8. Ao encerrar uma task, **pare** e aguarde aprovação explícita. Não inicie a próxima task no mesmo turno.

**Convenções**

- `PRD §x.y` refere-se a uma seção do [PRD](./prd.md).
- `AC-xx` refere-se aos critérios de aceite da §12 do PRD.
- `RF-xx` refere-se aos requisitos funcionais da §7 do PRD.
- No Windows/PowerShell deste ambiente, use `npm.cmd` no lugar de `npm` (scripts `.ps1` estão bloqueados).

---

## Portões de qualidade

Válidos para **todas** as tasks, além dos critérios específicos:

1. `npm.cmd run build` termina sem erros de TypeScript.
2. `npm.cmd run test` termina verde (obrigatório a partir da T03).
3. Nenhum erro no console do navegador no fluxo normal.
4. Nenhuma chamada `fetch` fora de `src/services/open-meteo.ts` (a partir da T07).
5. Nenhuma dependência de runtime adicionada; nenhum `localStorage`, `sessionStorage`, cookie ou IndexedDB.
6. Nenhum código, asset ou texto do template Vite permanece.
7. A interface continua em pt-BR e o build continua estático.

---

## Visão geral

| ID | Task | Depende de | PRD |
| --- | --- | --- | --- |
| T01 | Fundação TypeScript e limpeza do template | — | §9.9, §10.12, §10.13 |
| T02 | Metadados, favicon e base visual | T01 | §10.13, §11.4, §11.5, §11.6 |
| T03 | Infra de testes e normalização de busca | T02 | §7.2, §9.10 |
| T04 | Contratos de domínio e estado | T01 | §10.4, §10.5 |
| T05 | Weather codes e descrições | T04 | §7.8, §11.7 |
| T06 | Formatadores de data, número, unidade e vento | T04 | §7.9, §7.10, §10.10 |
| T07 | Serviço Open-Meteo: geocodificação | T04 | §7.3, §10.6, §10.11 |
| T08 | Serviço Open-Meteo: clima atual | T07 | §7.4, §10.6, §10.11 |
| T09 | Orquestração da busca | T07, T08 | §7.5, §10.7 |
| T10 | Shell, ícones e helpers de UI | T02, T05 | §10.9, §11.6, §11.7 |
| T11 | Empty state e bootstrap | T04, T10 | §7.11, §11.6, AC-01 |
| T12 | Loading e estado do botão | T11 | §7.2, §7.11, §11.6 |
| T13 | Render do sucesso (sidebar + métricas) | T05, T06, T10, T11 | §7.6, §7.7, AC-02 |
| T14 | Render dos erros e retry | T10, T11 | §7.11, §11.6, AC-05 a AC-07 |
| T15 | Controller: fluxo de busca | T03, T09, T11 a T14 | §7.2, §7.5, §10.8 |
| T16 | Controller: timeout, concorrência e foco | T15 | §7.5, §9.8, §10.8, §10.11 |
| T17 | Responsividade | T12, T13, T14 | §11.2, §11.3, AC-15 |
| T18 | Acessibilidade e movimento | T16, T17 | §9.5, §11.8, §11.9, AC-16 |
| T19 | QA final e Definition of Done | T18 | §12, §14, §16 |

---

## Fase 0 — Fundação

### T01 — Fundação TypeScript e limpeza do template

- [x] **T01 concluída**
- **Depende de:** —
- **PRD:** §9.9, §10.12, §10.13
- **Entregáveis:**
  - `tsconfig.json` com `"strict": true`, preservando as flags existentes.
  - Remoção de `src/counter.ts`, `src/assets/hero.png`, `src/assets/typescript.svg`, `src/assets/vite.svg`, `public/icons.svg` e de suas referências.
  - `src/main.ts` mínimo, sem demo, importando `src/style.css`.
  - `src/style.css` sem os estilos do template.
  - `index.html` reduzido ao necessário, sem o markup demo.
- **Aprovação:**
  1. `npm.cmd run build` passa.
  2. `strict: true` está presente e `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch` e `verbatimModuleSyntax` continuam habilitadas.
  3. Busca no projeto não encontra referências a `counter`, `hero.png`, `typescript.svg`, `vite.svg` ou `icons.svg`.
  4. A página carrega sem erro no console e sem qualquer elemento do template.
  5. Nenhuma dependência de runtime foi adicionada.
- **Limites:** não criar shell, componentes ou estilos finais; isso pertence às próximas tasks.

---

### T02 — Metadados, favicon e base visual

- [x] **T02 concluída**
- **Depende de:** T01
- **PRD:** §10.13, §11.4, §11.5, §11.6 (Página), §9.5
- **Entregáveis:**
  - `index.html` com `lang="pt-BR"`, título, meta description e `theme-color` definidos na §10.13/§11.10.
  - Favicon de clima em SVG, substituindo o padrão.
  - `src/style.css` com os tokens da §11.4, reset/`box-sizing`, fundo da página, tipografia base e utilitário `.sr-only`.
- **Aprovação:**
  1. `lang`, título, description e `theme-color` conferem com o PRD; não resta favicon do Vite.
  2. Os tokens da §11.4 estão presentes com os valores exatos, incluindo `color-scheme: light`, cores, raios, sombras e fonte do sistema.
  3. A página tem fundo `--bg`, `min-height: 100svh`, `margin: 0`, `min-width: 320px` e `.sr-only` funcional.
  4. Em 320 px não há rolagem horizontal causada pela base.
  5. `npm.cmd run build` passa e não há erro no console.
- **Limites:** não montar a busca, o cartão ou os estados.

---

### T03 — Infra de testes e normalização de busca

- [x] **T03 concluída**
- **Depende de:** T02
- **PRD:** §7.2 (normalização), §9.10, §9.1
- **Entregáveis:**
  - `vitest` e `jsdom` como **devDependencies**, com configuração mínima em `vitest.config.ts` (ambiente padrão `node`; testes de DOM declaram `@vitest-environment jsdom`). Adotado como padrão de verificação, conforme recomendação da §9.10.
  - Scripts `test` e `test:watch` em `package.json`.
  - `src/app/query.ts` com a normalização de query descrita na §7.2 (trim e colapso de espaços internos; o limite de 80 caracteres é atributo do input na T10).
  - Testes de `normalizeQuery`.
- **Aprovação:**
  1. As dependências novas aparecem apenas em `devDependencies`; o bundle de produção não as inclui.
  2. `npm.cmd run test` executa e passa testes para: espaços nas pontas, espaços internos repetidos, string vazia, tabs/quebras de linha e texto já normalizado.
  3. `npm.cmd run build` continua passando.
  4. Os testes importam `describe`/`it`/`expect` explicitamente de `vitest` (sem depender de globals).
  5. `normalizeQuery` não faz requisição, não altera estado e não trunca o texto.
- **Limites:** não criar testes de UI ou de rede ainda; a infraestrutura deve ser mínima.

---

## Fase 1 — Domínio

### T04 — Contratos de domínio e estado

- [x] **T04 concluída**
- **Depende de:** T01
- **PRD:** §10.4, §10.5, §9.9
- **Entregáveis:**
  - `src/domain/types.ts` com `City`, `WeatherUnits`, `CurrentWeather`, `WeatherSnapshot` e `WeatherLookupResult`.
  - `src/app/state.ts` com `AppState`.
- **Aprovação:**
  1. Os tipos têm exatamente os campos, nomes e uniões da §10.4/§10.5.
  2. `AppState` cobre os seis estados previstos; `WeatherLookupResult` cobre os quatro resultados.
  3. Não há `any`, `enum` ou classes; `import type` é usado quando aplicável.
  4. `npm.cmd run build` passa.
  5. Nenhum código de runtime, chamada de rede ou decisão de UI foi introduzido.
- **Limites:** não implementar validação, formatação, renderização ou controller.

---

### T05 — Weather codes e descrições

- [ ] **T05 concluída**
- **Depende de:** T04
- **PRD:** §7.8, §11.7 (chaves de ícone), §7.4 (`weather_code` desconhecido)
- **Entregáveis:**
  - `src/domain/weather-codes.ts` com o mapa dos códigos WMO, descrições em pt-BR e chave de ícone.
  - Função de consulta que recebe código e `isDay` e retorna descrição + chave de ícone.
  - Testes cobrindo todos os códigos.
- **Aprovação:**
  1. Os 28 códigos da §7.8 estão mapeados com as descrições exatas, sem `enum`.
  2. As chaves de ícone conferem com a tabela, incluindo `cloud` para o código 3 e variantes dia/noite apenas para 0, 1 e 2.
  3. Código desconhecido retorna “Condição desconhecida” e ícone `unknown`, sem lançar erro; o código bruto continua disponível no domínio para a UI.
  4. Testes cobrem todos os códigos, as variantes dia/noite e códigos não listados/negativos.
  5. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não criar SVGs nem renderização; a biblioteca de ícones é da T10.

---

### T06 — Formatadores de data, número, unidade e vento

- [ ] **T06 concluída**
- **Depende de:** T04
- **PRD:** §7.9, §7.10, §10.10, AC-02, AC-14
- **Entregáveis:**
  - `src/domain/format.ts` com parsing de `current.time`, data, horário, números, unidades, direção cardinal e composição da linha do vento.
  - Testes dos formatadores.
- **Aprovação:**
  1. `2026-06-17T09:45` gera `Quarta-feira, 17 de junho` e `09:45`, sem deslocar o dia em nenhum fuso do navegador.
  2. Com os dados de exemplo da §7.4/AC-02, os formatadores produzem `19`, `21,4`, `92`, `73`, `5,8`, `277` e `de O · 277°`, com os separadores e unidades da §7.10 (`\u00A0` antes de `°C` e `km/h`; `%` e `°` colados).
  3. A rosa dos ventos usa os 16 pontos em português; `277` → `O`, `90` → `L`, `0` e `360` → `N`, `22.5` → `NNE`.
  4. `parseLocalIso` retorna `null` para entrada inválida, sem lançar; não há uso de `toFixed()` para exibição.
  5. Testes cobrem os exemplos acima, arredondamentos e limites; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não renderizar nem buscar dados; os formatadores são puros.

---

## Fase 2 — Dados

### T07 — Serviço Open-Meteo: geocodificação

- [ ] **T07 concluída**
- **Depende de:** T04
- **PRD:** §7.3, §9.3, §9.6, §9.10, §10.6, §10.11
- **Entregáveis:**
  - `src/services/open-meteo.ts` com infraestrutura compartilhada de `fetch`, `OpenMeteoRequestError` e `searchCity`.
  - Testes do serviço com `fetch` mockado.
- **Aprovação:**
  1. A URL usa o endpoint de geocodificação, `URL`/`URLSearchParams`, `count=1`, `language=pt` e `format=json`, com o nome corretamente codificado.
  2. Nome ausente, vazio ou não-string retorna `null` **sem** chamar `fetch`.
  3. `results` ausente/vazio, primeiro item inválido ou qualquer campo obrigatório fora das faixas da §7.3 resulta em `null`; nenhum resultado parcial é retornado.
  4. Apenas o primeiro resultado é considerado; `country_code` é preservado como veio e `timezone` é validado com `Intl` em try/catch.
  5. `fetch` recebe `signal`, `cache: 'no-store'` e `Accept: application/json`; HTTP não-2xx, falha de rede e JSON inválido lançam `OpenMeteoRequestError` com `endpoint: 'geocoding'` e `status` quando houver.
  6. `AbortError` é propagado sem ser convertido em `OpenMeteoRequestError`.
  7. A partir desta task, `fetch` existe apenas em `src/services/open-meteo.ts`.
  8. Testes cobrem sucesso, nome inválido, sem resultados, campos inválidos, HTTP 500, rede, JSON inválido e abort; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não implementar consulta de clima, orquestração ou UI.

---

### T08 — Serviço Open-Meteo: clima atual

- [ ] **T08 concluída**
- **Depende de:** T07
- **PRD:** §7.4, §10.6, §10.11, AC-02
- **Entregáveis:**
  - `getCurrentWeather` em `src/services/open-meteo.ts`.
  - Testes adicionais no arquivo de testes do serviço.
- **Aprovação:**
  1. Cidade com latitude, longitude ou timezone ausente/inválida retorna `null` sem chamar `fetch`.
  2. A URL usa o endpoint de forecast, latitude, longitude, `timezone` e o parâmetro `current` exatamente como na §7.4.
  3. Todos os campos obrigatórios e faixas da §7.4 são validados; `is_day` aceita apenas `0`/`1`; `weather_code` é inteiro, mas códigos desconhecidos são aceitos.
  4. `precipitation` continua na URL, mas sua ausência não invalida o resultado e o volume não entra em `CurrentWeather`.
  5. As unidades vêm de `current_units`, com fallback por campo conforme a §7.4; unidades ausentes ou inválidas não quebram o resultado.
  6. HTTP não-2xx, rede, JSON inválido e abort seguem o comportamento da T07; `fetch` mantém `cache: 'no-store'`, `Accept` e `signal`.
  7. Testes cobrem a resposta de exemplo, cada campo obrigatório ausente/inválido, unidades parciais/ausentes, código desconhecido, `precipitation` ausente e erros de transporte.
  8. `npm.cmd run test` e `npm.cmd run build` passam; nenhum `fetch` novo fora do serviço.
- **Limites:** não orquestrar a busca, não renderizar e não tomar decisões de UI.

---

### T09 — Orquestração da busca

- [ ] **T09 concluída**
- **Depende de:** T07, T08
- **PRD:** §7.5, §10.7, §9.8
- **Entregáveis:**
  - `src/services/weather-lookup.ts` com `lookupWeather`.
  - Testes de orquestração com os serviços mockados.
- **Aprovação:**
  1. A ordem é sempre geocodificação → clima, usando o mesmo `signal` nas duas chamadas.
  2. Cidade `null` retorna `city-not-found` **sem** chamar o clima.
  3. Clima `null` retorna `weather-unavailable` com o `city.name` canônico.
  4. Sucesso retorna `{ status: 'success', data: { city, weather } }` sem dados parciais.
  5. `OpenMeteoRequestError` vira `network-error`; erros inesperados também viram `network-error` com log apenas em desenvolvimento; `AbortError` é repassado sem conversão.
  6. Testes cobrem os quatro resultados, ordem das chamadas, curto-circuito, abort e erro inesperado.
  7. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não criar controller, estado de UI ou renderização.

---

## Fase 3 — Interface

### T10 — Shell, ícones e helpers de UI

- [ ] **T10 concluída**
- **Depende de:** T02, T05
- **PRD:** §10.9, §7.2, §7.12, §11.6 (Área de busca e Rodapé), §11.7, §9.5
- **Entregáveis:**
  - Shell persistente conforme a §10.9: busca, `#content`, rodapé e região de status.
  - `src/ui/dom.ts` com helpers seguros de criação/texto/limpeza.
  - `src/ui/icons.ts` com todos os ícones do conjunto mínimo da §11.7, incluindo os de clima e os utilitários.
  - `src/ui/shell.ts` com referências aos elementos do shell.
  - CSS da busca, do foco e do rodapé conforme a §11.6.
- **Aprovação:**
  1. A estrutura do shell segue a §10.9: `h1` acessível, formulário `role="search"`, label, input `type="search"` com `maxlength="80"` e `autocomplete="off"`, botão de submit, `#content`, rodapé e região `role="status"`.
  2. Apenas `#content` é substituído entre estados; o formulário não é recriado.
  3. A busca não tem background próprio, tem largura máxima de 560 px, o controle e o foco seguem a §11.6 e o botão tem área de toque de pelo menos 44 px.
  4. O rodapé exibe a atribuição da §7.12, com link para a Open-Meteo em nova aba e `rel="noopener noreferrer"`.
  5. Todos os ícones da §11.7 existem como SVG inline, com viewBox/stroke corretos, `aria-hidden` por padrão; não há emoji, `<img>` ou biblioteca externa.
  6. A página não faz requisição ao carregar.
  7. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não implementar empty/loading/sucesso/erros nem comportamento de submit; apenas estrutura e estilos do shell.

---

### T11 — Empty state e bootstrap

- [ ] **T11 concluída**
- **Depende de:** T04, T10
- **PRD:** §7.11 (`empty`), §11.6 (Empty state), §11.10, AC-01
- **Entregáveis:**
  - `src/ui/render.ts` com `renderEmpty` e o ponto de renderização por estado.
  - Bootstrap em `src/main.ts` que renderiza o empty state no `#content`.
  - CSS do empty state conforme a §11.6.
- **Aprovação:**
  1. Ao abrir o app, o empty state aparece com os textos exatos de `empty.title`, `empty.body` e `empty.hint` da §11.10.
  2. O input está vazio, o foco não é forçado e nenhuma requisição é feita.
  3. O cartão tem largura máxima de 800 px, o conteúdo centralizado e as medidas da §11.6; nenhum valor meteorológico falso é exibido.
  4. O estado é dirigido por `AppState` (`empty`), sem lógica de UI duplicada.
  5. Teste de renderização verifica textos, ausência de dados e ausência de chamadas de rede; `npm.cmd run test` e `npm.cmd run build` passam.
  6. Recarregar a página sempre volta ao empty state.
- **Limites:** não implementar loading, sucesso, erros ou submit.

---

### T12 — Loading e estado do botão

- [ ] **T12 concluída**
- **Depende de:** T11
- **PRD:** §7.2 (loading), §7.11 (`loading`), §11.6 (Loading), §11.8, §9.4
- **Entregáveis:**
  - `renderLoading` em `src/ui/render.ts`, com skeletons equivalentes ao layout de sucesso.
  - Função no shell para alternar o botão entre “Buscar” e “Buscando…” com spinner.
  - CSS de skeleton, spinner e `prefers-reduced-motion` conforme a §11.6/§11.8.
- **Aprovação:**
  1. O loading mostra apenas skeletons, sem números, labels de valores ou dados falsos.
  2. As dimensões dos skeletons correspondem ao layout final da §11.6, sem mudança de tamanho do cartão.
  3. O botão exibe spinner e “Buscando…”, permanece focável e o input continua editável.
  4. `#content` recebe `aria-busy="true"` durante o loading e o estado é limpo ao sair.
  5. A animação é desativada em `prefers-reduced-motion: reduce`.
  6. Testes verificam textos, ausência de valores, `aria-busy` e estado do botão; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não ligar o loading a uma busca real; a integração é da T15.

---

### T13 — Render do sucesso (sidebar + métricas)

- [ ] **T13 concluída**
- **Depende de:** T05, T06, T10, T11
- **PRD:** §7.6, §7.7, §7.8, §7.9, §7.10, §11.5, §11.6, AC-02, AC-12, AC-13, AC-14, AC-17
- **Entregáveis:**
  - `renderSuccess(snapshot)` em `src/ui/render.ts`, compondo sidebar e área principal.
  - CSS da sidebar, das métricas, da tipografia e do grid 2×2 conforme a §11.6.
  - Testes com o snapshot de exemplo da §7.4.
- **Aprovação:**
  1. Com o snapshot de exemplo, a sidebar exibe `19 °C`, `Rio de Janeiro, BR`, `Quarta-feira, 17 de junho`, `Atualizado às 09:45`, `Dia` e `Parcialmente nublado` + `Código WMO 2`.
  2. A área principal exibe `92%`, `21,4 °C`, `73%`, `5,8 km/h` e `de O · 277°`, com os labels da §7.7 e o vento em hierarquia valor + direção.
  3. A ordem da sidebar e a grade 2×2 seguem a §7.6/§7.7; o volume de precipitação não é exibido.
  4. Nome canônico, país em maiúsculas, data/hora e unidades usam os formatadores e os dados do snapshot, sem recalcular com a data do navegador.
  5. Código desconhecido usa o fallback da T05 sem quebrar o resultado.
  6. Nome de cidade com HTML é renderizado literalmente (sem injeção), comprovado por teste; ícones têm `aria-hidden`.
  7. A área principal não tem scroll interno; o comportamento em 320 px é fechado na T17.
  8. Testes cobrem AC-02, código desconhecido, nome longo/HTML e vento; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não implementar estados de erro, loading ou controller; não ajustar ainda os breakpoints de 720/560 (T17).

---

### T14 — Render dos erros e retry

- [ ] **T14 concluída**
- **Depende de:** T10, T11
- **PRD:** §7.11 (`city-not-found`, `weather-unavailable`, `network-error`), §11.6 (Erros), §11.10, AC-05, AC-06, AC-07
- **Entregáveis:**
  - `renderCityNotFound`, `renderWeatherUnavailable` e `renderNetworkError` em `src/ui/render.ts`.
  - Botão “Tentar novamente” com callback injetado, quando aplicável.
  - CSS dos três cartões de erro conforme a §11.6.
  - Testes de cada estado.
- **Aprovação:**
  1. Os textos seguem exatamente as chaves da §11.10, com `{query}`/`{city}` escapados.
  2. “Cidade não encontrada” não exibe retry; “Clima indisponível” exibe o nome da cidade e retry; “Não foi possível conectar” exibe retry.
  3. Nenhum erro renderiza sidebar, métricas ou valores antigos.
  4. Cada erro tem ícone, título e mensagem; a informação não depende apenas de cor.
  5. O botão de retry chama o callback recebido e tem área de toque/foco acessíveis.
  6. Testes cobrem os três estados, escaping, presença/ausência de retry e conteúdo; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não implementar a lógica de nova tentativa nem transições de estado; isso pertence ao controller (T15).

---

## Fase 4 — Integração

### T15 — Controller: fluxo de busca

- [ ] **T15 concluída**
- **Depende de:** T03, T09, T11 a T14
- **PRD:** §7.2, §7.5, §7.11, §8.1, §10.8, §10.9 (região de status), AC-03, AC-04, AC-05, AC-06, AC-07, AC-09, AC-10
- **Entregáveis:**
  - `src/app/controller.ts` com submit, normalização, validação inline, loading, chamada de `lookupWeather`, transições de `AppState`, render e retry.
  - Integração do controller em `src/main.ts`.
  - Funções de shell para erro inline (`aria-invalid`, `aria-describedby`, foco).
  - Testes do controller com `lookupWeather` mockado.
- **Aprovação:**
  1. Enter e clique no botão disparam o mesmo fluxo; a query é normalizada antes da busca.
  2. Query vazia não faz requisição, mostra “Digite o nome de uma cidade.”, recebe foco e não altera o conteúdo atual.
  3. Durante a busca, um único loading é exibido; ao final, apenas `success` ou um dos três erros é renderizado, nunca dados parciais.
  4. O valor digitado é preservado em todos os estados; retry reenvia a última query e restaura o input.
  5. Uma busca nova durante outra cancela a anterior, e respostas antigas não sobrescrevem o resultado atual.
  6. A região `role="status"` recebe as mensagens da §10.9; o input e o botão continuam acessíveis durante o loading.
  7. Testes cobrem submit por Enter/botão, query vazia, sucesso, os três erros, retry e corrida entre buscas.
  8. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não implementar ainda timeout de 12 s nem os refinamentos de foco/seleção da T16.

---

### T16 — Controller: timeout, concorrência e foco

- [ ] **T16 concluída**
- **Depende de:** T15
- **PRD:** §7.5, §9.8, §10.8, §10.11, AC-08, AC-09, AC-10, AC-16
- **Entregáveis:**
  - Timeout total de 12 s com `setTimeout`/`AbortController`, limpando o timer no `finally`.
  - Proteção por `requestId` e descarte de respostas fora de ordem.
  - Regra de mesma query em andamento: ignorar; query diferente: cancelar a anterior.
  - Comportamento de foco da §7.11 e mensagens/estado da região `aria-live`.
  - Testes com timers falsos e promises controladas.
- **Aprovação:**
  1. Busca que excede 12 s é abortada e resulta em `network-error`, sem travar a UI.
  2. Timeout e cancelamento limpam timers/controllers; não há promise rejeitada sem tratamento nem erro no console.
  3. Abort por nova busca não gera UI de erro; a resposta antiga é ignorada mesmo se chegar depois.
  4. Reenviar a mesma query durante o loading é ignorado; query diferente cancela a anterior e inicia outra.
  5. Em `city-not-found`, o input mantém o texto, recebe foco e o texto é selecionado; em sucesso, o foco não é movido.
  6. As mensagens de status correspondem à §10.9 e são anunciadas uma vez por transição.
  7. Testes cobrem timeout, abort, resposta fora de ordem, mesma query, foco/seleção e retry; `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não alterar contratos de serviço nem criar novos estados; apenas o comportamento do controller.

---

## Fase 5 — Acabamento e entrega

### T17 — Responsividade

- [ ] **T17 concluída**
- **Depende de:** T12, T13, T14
- **PRD:** §11.2, §11.3, §9.2, AC-15
- **Entregáveis:**
  - Media queries e ajustes de layout em `src/style.css` nos breakpoints de 720, 560 e 380 px.
  - Ajustes de tipografia, paddings, raios, altura da busca e tiles horizontais.
- **Aprovação:**
  1. Acima de 720 px, o cartão usa duas colunas com sidebar de 280 px e largura máxima de 800 px.
  2. Em `max-width: 720px`, a sidebar vira bloco superior, com borda inferior e sem borda direita.
  3. Em `max-width: 560px`, as métricas viram uma coluna com tiles horizontais; tamanhos de tipografia e paddings seguem a §11.3.
  4. Em `max-width: 380px`, o botão mantém “Buscar” visível e o padding não causa overflow.
  5. Em 320, 360, 720, 768 e 1280 px não há rolagem horizontal; em 768 px o layout continua em duas colunas.
  6. Nome de cidade longo quebra linha sem vazar do cartão; a área principal não cria scroll interno.
  7. A verificação é registrada com screenshots ou inspeção de DevTools nos cinco widths; zoom de 200% mantém o conteúdo acessível.
  8. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não redesenhar componentes nem alterar textos; apenas adaptação responsiva.

---

### T18 — Acessibilidade e movimento

- [ ] **T18 concluída**
- **Depende de:** T16, T17
- **PRD:** §9.5, §11.8, §11.9, AC-16
- **Entregáveis:**
  - Auditoria e correções de foco, teclado, ARIA, contraste, áreas de toque e movimento.
  - Ajustes finais de `prefers-reduced-motion`.
- **Aprovação:**
  1. Navegação completa por Tab/Shift+Tab, com ordem lógica e foco visível em todos os interativos, sobre fundo claro e escuro.
  2. Input com label acessível; erro inline associado por `aria-describedby`/`aria-invalid`; região `aria-live`/`status` anuncia loading, sucesso e erros; `aria-busy` funciona.
  3. Ícones decorativos com `aria-hidden="true"`; nenhuma informação transmitida apenas por cor.
  4. Áreas de toque com pelo menos 44×44 px; contraste dos tokens e estados atende à §9.5.
  5. Com `prefers-reduced-motion: reduce`, transições, pulso e spinner não animam, e toda a informação permanece visível.
  6. Um fluxo completo (busca + erro) é validado com leitor de tela ou, no mínimo, com a árvore de acessibilidade do navegador.
  7. `npm.cmd run test` e `npm.cmd run build` passam.
- **Limites:** não alterar comportamento funcional nem textos; apenas acessibilidade e movimento.

---

### T19 — QA final e Definition of Done

- [ ] **T19 concluída**
- **Depende de:** T18
- **PRD:** §12, §14, §16, §10.14, §9.6
- **Entregáveis:**
  - Correções finais necessárias para fechar os critérios de aceite.
  - Relatório de QA no encerramento da task.
- **Aprovação:**
  1. Todos os critérios AC-01 a AC-20 da §12 foram verificados e comprovados.
  2. Todo o checklist da §14 foi executado, incluindo funcional, dados/formatação, visual/responsivo, acessibilidade e técnico.
  3. O fluxo real com “Rio de Janeiro” produz os valores do AC-02; se a rede/API impedir, a limitação é registrada e a task **não** é marcada como concluída.
  4. `npm.cmd run build`, `npm.cmd run test` e `npm.cmd run preview` funcionam; o `dist` é estático e não depende de backend.
  5. Busca confirma: nenhum `fetch` fora de `src/services/open-meteo.ts`, nenhum storage/cookie, nenhum template demo, `strict: true` e nenhuma dependência de runtime.
  6. Não há erros no console, dados parciais em tela, scroll horizontal em 320 px ou falhas de contraste/foco conhecidas.
  7. Todos os itens do Definition of Done da §16 estão atendidos.
  8. O usuário deu aprovação visual final.
- **Limites:** não abrir novas funcionalidades; problemas encontrados viram correção nesta task ou uma nova task registrada antes de encerrar.

---

## Definition of Done das tasks

Uma task só está concluída quando:

- [ ] Os critérios de **Aprovação** da task foram comprovados.
- [ ] Os portões de qualidade globais continuam verdes.
- [ ] Nenhum item de uma task futura foi antecipado.
- [ ] A linha de conclusão da task foi marcada como `[x]`.
- [ ] O relatório da task foi entregue.

> Tasks concluídas não devem ser reabertas sem registrar o motivo. Se um requisito do PRD mudar, atualize primeiro o PRD e depois esta lista.
