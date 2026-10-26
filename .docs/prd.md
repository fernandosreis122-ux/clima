# PRD — Clima

| Campo | Valor |
| --- | --- |
| Versão | 1.0 |
| Status | Pronto para implementação |
| Data | 26/10/2026 |
| Produto | Clima — consulta de condições atuais por cidade |
| Stack | Vite + Vanilla TypeScript + CSS puro |
| Fonte | `.docs/brain-dump.md` |
| Escopo | MVP de uma página, client-side, sem backend |

---

## 1. Resumo executivo

O **Clima** é uma aplicação web estática de página única que permite consultar as condições meteorológicas atuais de uma cidade. O usuário digita o nome da cidade, o app resolve a localização via API de geocodificação da Open-Meteo e, em seguida, consulta as condições atuais na API de previsão da Open-Meteo.

O resultado é apresentado em um cartão branco centralizado sobre um fundo cinza escuro:

- **Sidebar:** temperatura, cidade + código do país, data atual, indicador dia/noite e condição meteorológica (weather code).
- **Área principal:** umidade relativa, temperatura aparente, probabilidade de precipitação e velocidade/direção do vento.

A experiência é deliberadamente simples: uma busca, um loading único e estados de erro claros, sem dados parciais.

---

## 2. Contexto e problema

Consultar o clima rapidamente costuma exigir navegação por sites carregados de informações, anúncios e previsões de vários dias. Para o MVP, o objetivo é responder à pergunta central — **“como está o clima agora nesta cidade?”** — com o mínimo de interação e com foco nas métricas essenciais.

A aplicação não terá backend: toda a comunicação com a Open-Meteo será feita no navegador, por meio de um módulo dedicado que centraliza as chamadas HTTP, validações e normalização dos dados.

---

## 3. Objetivos e critérios de sucesso

### 3.1 Objetivos do produto

| ID | Objetivo |
| --- | --- |
| OBJ-01 | Permitir que o usuário encontre o clima atual de uma cidade em, no máximo, uma busca. |
| OBJ-02 | Exibir as informações essenciais com hierarquia visual clara: temperatura em destaque, cidade e condição ao redor, métricas secundárias na área principal. |
| OBJ-03 | Tratar falhas sem exibir dados parciais ou telas quebradas. |
| OBJ-04 | Manter a experiência utilizável em desktop e mobile, com acessibilidade AA. |

### 3.2 Critérios de sucesso do MVP

- O usuário consegue buscar por uma cidade usando Enter ou o botão.
- A busca completa (geocodificação + clima) é percebida como uma única operação, com um único estado de loading.
- Todos os estados previstos são implementados: empty, loading, success, cidade não encontrada, clima indisponível, erro de conexão e validação inline do campo.
- Nenhum dado de clima é renderizado se qualquer uma das duas requisições falhar ou retornar dados inválidos.
- A interface funciona sem rolagem horizontal entre 320 px e 1920 px de largura.
- A página passa nos critérios de acessibilidade definidos neste documento.

---

## 4. Escopo

### 4.1 Dentro do escopo

- Busca por nome de cidade.
- Geocodificação via Open-Meteo Geocoding API.
- Consulta de condições atuais via Open-Meteo Forecast API.
- Exibição de temperatura, cidade + código do país, data, dia/noite, weather code, umidade, sensação térmica, probabilidade de precipitação e vento.
- Estados de empty, loading, sucesso e erros distintos.
- Layout responsivo com sidebar que se transforma em bloco superior no mobile.
- Acessibilidade AA, incluindo navegação por teclado e leitores de tela.
- Atribuição visível à Open-Meteo.
- Build estático pronto para hospedagem.

### 4.2 Fora do escopo

- Previsão por hora, diária ou semanal.
- Gráficos, mapas, radar ou animações meteorológicas.
- Múltiplas cidades, favoritos, histórico ou comparação.
- Geolocalização automática ou detecção por IP.
- Autocomplete, sugestões ou busca conforme o usuário digita.
- Alternância de unidades (°F/mph) ou de idioma.
- Alternância de tema claro/escuro.
- Notificações, alertas ou dados de qualidade do ar, UV, nascer/pôr do sol.
- Persistência em `localStorage`, cookies, URL ou qualquer outro mecanismo.
- Backend, proxy, autenticação, banco de dados ou analytics.
- Atualização automática dos dados ou polling.
- Compartilhamento de resultado por URL.
- Exibição do volume de precipitação (`precipitation`).

---

## 5. Público e casos de uso

### 5.1 Público

Pessoas que precisam consultar rapidamente as condições atuais de uma cidade, em qualquer dispositivo, sem cadastro e sem instalar nada. A interface é em português do Brasil.

### 5.2 Casos de uso

| ID | Caso de uso |
| --- | --- |
| UC-01 | Consultar o clima atual da própria cidade pelo nome. |
| UC-02 | Consultar o clima de uma cidade que será visitada. |
| UC-03 | Corrigir o nome de uma cidade após uma busca sem resultado. |
| UC-04 | Tentar novamente após uma falha temporária de rede ou de serviço. |

---

## 6. Jornada do usuário

1. O usuário abre o app e vê o campo de busca no topo e o empty state.
2. Digita o nome de uma cidade e pressiona Enter ou clica em **Buscar**.
3. O app entra em loading e executa, em sequência:
   1. geocodificação do nome;
   2. consulta do clima com latitude, longitude e timezone retornados.
4. Se as duas etapas forem bem-sucedidas, o app renderiza o cartão com sidebar e métricas.
5. Se a cidade não for encontrada, o app informa e mantém o nome digitado para correção.
6. Se a cidade for encontrada mas o clima falhar, o app informa “clima indisponível” e oferece nova tentativa.
7. Se houver falha de rede, timeout ou erro HTTP, o app informa o erro de conexão e oferece nova tentativa.
8. Uma nova busca sempre substitui o resultado anterior; não há dados antigos em tela.

---

## 7. Requisitos funcionais

### 7.1 Visão geral dos requisitos

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Busca por cidade com input e botão, acionável por Enter. | Must |
| RF-02 | Geocodificação com validação dos campos obrigatórios. | Must |
| RF-03 | Consulta do clima atual com validação dos campos obrigatórios. | Must |
| RF-04 | Pipeline único com loading, timeout, cancelamento e sem dados parciais. | Must |
| RF-05 | Sidebar com temperatura, cidade/país, data, dia/noite e weather code. | Must |
| RF-06 | Área principal com umidade, sensação térmica, precipitação e vento. | Must |
| RF-07 | Interpretação completa dos weather codes WMO em pt-BR. | Must |
| RF-08 | Data e horário no fuso da cidade, formatados em pt-BR. | Must |
| RF-09 | Formatação numérica, unidades e direção do vento. | Must |
| RF-10 | Estados de UI distintos e acionáveis. | Must |
| RF-11 | Atribuição visível à Open-Meteo. | Must |
| RF-12 | Responsividade e acessibilidade. | Must |

Prioridades seguem MoSCoW: **Must** é obrigatório para o MVP.

---

### 7.2 RF-01 — Busca por cidade

**Descrição**

O app deve ter uma área superior centralizada contendo apenas o formulário de busca. O formulário é composto por:

- um campo de texto para o nome da cidade;
- um botão **Buscar**.

**Regras**

- A busca pode ser disparada por Enter no campo ou por clique/toque no botão.
- O input deve ser do tipo `search`, com label acessível.
- Placeholder: “Digite o nome da cidade”.
- O valor deve ser normalizado antes da requisição:
  - remover espaços no início e no fim;
  - colapsar espaços internos repetidos;
  - limitar a 80 caracteres (`maxlength`).
- Se o valor normalizado estiver vazio:
  - nenhuma requisição é feita;
  - uma mensagem inline é exibida: “Digite o nome de uma cidade.”;
  - o estado de conteúdo atual não é alterado;
  - o foco vai para o input.
- Não há busca automática enquanto o usuário digita, nem sugestões/autocomplete.
- Durante o loading:
  - o input permanece editável;
  - o botão exibe spinner e o texto “Buscando…”;
  - enviar a mesma consulta novamente é ignorado;
  - enviar uma consulta diferente cancela a anterior e inicia uma nova;
  - o botão permanece focável.
- O valor digitado é preservado entre estados (loading, sucesso e erros), para permitir correção.
- O app não persiste a última cidade. Recarregar a página retorna ao empty state.

---

### 7.3 RF-02 — Geocodificação

**Endpoint**

```text
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={NOME_DA_CIDADE}
  &count=1
  &language=pt
  &format=json
```

**Regras**

- O nome deve ser enviado com codificação correta via `URL` + `URLSearchParams`.
- `count` é fixo em `1`; não há tela de escolha de resultados.
- Usar o primeiro item de `results`, quando existir.
- Campos obrigatórios do resultado:
  - `name`: string não vazia;
  - `latitude`: número finito entre -90 e 90;
  - `longitude`: número finito entre -180 e 180;
  - `country_code`: string não vazia;
  - `timezone`: string IANA válida.
- Se `results` estiver ausente, vazio ou qualquer campo obrigatório for inválido, o resultado é **cidade não encontrada**.
- Não renderizar cidade parcialmente encontrada.
- O `country_code` deve ser exibido em maiúsculas (ex.: `BR`).
- O nome canônico retornado pela API é o exibido no resultado, não o texto digitado.

---

### 7.4 RF-03 — Consulta do clima atual

**Endpoint**

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude={LATITUDE}
  &longitude={LONGITUDE}
  &current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code
  &timezone={TIMEZONE}
```

**Regras**

- Enviar latitude, longitude e timezone obtidos na geocodificação.
- O request usa `cache: 'no-store'` para evitar dados antigos.
- Campos obrigatórios em `current`:
  - `time` — string ISO local, ex.: `2026-06-17T09:45` (necessária para a data e o horário);
  - `temperature_2m` — número finito;
  - `relative_humidity_2m` — número finito entre 0 e 100;
  - `apparent_temperature` — número finito;
  - `is_day` — exatamente `0` ou `1`;
  - `wind_speed_10m` — número finito maior ou igual a 0;
  - `wind_direction_10m` — número finito entre 0 e 360;
  - `precipitation_probability` — número finito entre 0 e 100;
  - `weather_code` — inteiro.
- `weather_code` é obrigatório para a sidebar, embora não estivesse listado nas propriedades obrigatórias do brain dump.
- `precipitation` é solicitado na URL, mas não é exibido no MVP e não bloqueia o resultado se faltar.
- `current_units` deve ser usado para exibir as unidades. Se uma unidade específica estiver ausente, usar o fallback documentado:
  - temperatura: `°C`;
  - umidade: `%`;
  - probabilidade de precipitação: `%`;
  - vento: `km/h`;
  - direção: `°`.
- Se qualquer campo obrigatório estiver ausente ou inválido, o resultado é **clima indisponível**.
- Weather code desconhecido **não** invalida o resultado: exibir descrição genérica e o código bruto.
- Não converter unidades; não há seletor de unidades no MVP.

---

### 7.5 RF-04 — Pipeline, loading, timeout e cancelamento

**Fluxo**

```text
submit
  → validar query
  → cancelar busca anterior (se houver)
  → entrar em loading
  → geocodificar cidade
  → consultar clima
  → renderizar sucesso ou erro
```

**Regras**

- A busca é uma única operação para o usuário, com um único loading.
- O loading permanece até que as duas requisições terminem.
- Só há sucesso se as duas etapas retornarem dados válidos.
- Nunca renderizar sidebar ou métricas com dados parciais.
- Timeout total de **12 segundos** por busca, cobrindo as duas requisições.
- Em timeout, cancelar a requisição e exibir **erro de conexão**.
- Uma nova busca cancela a anterior via `AbortController`; respostas canceladas são ignoradas.
- Não há retry automático. O usuário pode tentar novamente manualmente.
- Erros técnicos não são exibidos crus para o usuário; a UI usa mensagens amigáveis.
- Não há cache de resultados nem polling.

**Matriz de erros**

| Etapa | Situação | Resultado | UI |
| --- | --- | --- | --- |
| Entrada | Query vazia | Nenhuma requisição | Erro inline no campo; estado de conteúdo inalterado |
| Geocodificação | Sem resultados ou campos inválidos | `city-not-found` | Cartão “Cidade não encontrada” |
| Geocodificação | HTTP não-2xx, falha de rede, JSON inválido, timeout | `network-error` | Cartão “Não foi possível conectar” |
| Clima | Campos obrigatórios ausentes/inválidos | `weather-unavailable` | Cartão “Clima indisponível” com o nome da cidade encontrada |
| Clima | HTTP não-2xx, falha de rede, JSON inválido, timeout | `network-error` | Cartão “Não foi possível conectar” |
| Ambos | Sucesso | `success` | Sidebar + área principal |
| Qualquer | Busca cancelada por outra busca | Ignorado | Nenhuma renderização |

---

### 7.6 RF-05 — Sidebar

A sidebar deve exibir, nesta ordem hierárquica:

1. **Temperatura atual** em destaque, usando `temperature_2m` e sua unidade.
2. **Cidade + código do país**, usando o nome canônico da geocodificação e `country_code` em maiúsculas. Ex.: `Rio de Janeiro, BR`.
3. **Data atual** no fuso da cidade, com dia da semana, dia e mês. Ex.: `Quarta-feira, 17 de junho`.
4. **Horário de atualização** do dado. Ex.: `Atualizado às 09:45`.
5. **Indicador dia/noite** baseado em `is_day`:
   - `1` → **Dia**, com ícone de sol;
   - `0` → **Noite**, com ícone de lua.
6. **Weather code**:
   - descrição em pt-BR;
   - ícone correspondente;
   - código WMO bruto como informação secundária. Ex.: `Código WMO 2`.

**Regras visuais e de conteúdo**

- Nomes longos devem quebrar linha sem causar overflow horizontal.
- O código do país é sempre exibido; o nome do país não é exibido no MVP.
- A temperatura principal é arredondada para inteiro (ex.: `19,3` → `19 °C`).
- A data e o horário vêm de `current.time`, que já está no fuso da cidade.
- Não usar a data local do navegador para montar a data exibida.
- Não há atualização automática; o horário indica quando o dado foi observado.

---

### 7.7 RF-06 — Área principal

A área principal deve exibir quatro métricas em grade 2×2 no desktop:

| Métrica | Fonte | Formato |
| --- | --- | --- |
| Umidade relativa | `relative_humidity_2m` | Inteiro + `%` |
| Sensação térmica | `apparent_temperature` | 1 casa decimal + `°C` |
| Probabilidade de precipitação | `precipitation_probability` | Inteiro + `%` |
| Vento | `wind_speed_10m` + `wind_direction_10m` | 1 casa decimal + `km/h`; direção cardinal + graus |

**Regras**

- Cada métrica tem label visível, ícone e valor.
- A direção do vento deve ser exibida como direção de origem, precedida de “de”:
  - exemplo: `de O · 277°`;
  - usar rosa dos ventos de 16 pontos em português: `N, NNE, NE, ENE, L, ESE, SE, SSE, S, SSO, SO, OSO, O, ONO, NO, NNO`;
  - `L` representa Leste.
- A velocidade e a direção são exibidas juntas, mas com hierarquia: velocidade como valor principal, direção como linha secundária.
- Não exibir volume de precipitação.
- Em telas estreitas, a grade passa para uma coluna, com tiles em formato horizontal.
- A área principal não deve fazer scroll interno.

---

### 7.8 RF-07 — Weather codes WMO

A descrição e o ícone devem seguir a tabela abaixo. A coluna “Ícone” refere-se à chave do SVG inline.

| Código | Descrição em pt-BR | Ícone | Variante dia/noite |
| --- | --- | --- | --- |
| 0 | Céu limpo | `sun` / `moon` | Sim |
| 1 | Predominantemente limpo | `cloud-sun` / `cloud-moon` | Sim |
| 2 | Parcialmente nublado | `cloud-sun` / `cloud-moon` | Sim |
| 3 | Nublado | `cloud` | Não |
| 45 | Nevoeiro | `fog` | Não |
| 48 | Nevoeiro com geada | `fog` | Não |
| 51 | Garoa leve | `drizzle` | Não |
| 53 | Garoa moderada | `drizzle` | Não |
| 55 | Garoa densa | `drizzle` | Não |
| 56 | Garoa congelante leve | `freezing-drizzle` | Não |
| 57 | Garoa congelante densa | `freezing-drizzle` | Não |
| 61 | Chuva leve | `rain` | Não |
| 63 | Chuva moderada | `rain` | Não |
| 65 | Chuva forte | `rain` | Não |
| 66 | Chuva congelante leve | `freezing-rain` | Não |
| 67 | Chuva congelante forte | `freezing-rain` | Não |
| 71 | Neve leve | `snow` | Não |
| 73 | Neve moderada | `snow` | Não |
| 75 | Neve forte | `snow` | Não |
| 77 | Grãos de neve | `snow-grains` | Não |
| 80 | Pancadas de chuva leves | `rain-showers` | Não |
| 81 | Pancadas de chuva moderadas | `rain-showers` | Não |
| 82 | Pancadas de chuva violentas | `rain-showers` | Não |
| 85 | Pancadas de neve leves | `snow-showers` | Não |
| 86 | Pancadas de neve fortes | `snow-showers` | Não |
| 95 | Tempestade leve ou moderada | `thunderstorm` | Não |
| 96 | Tempestade com granizo leve | `thunderstorm-hail` | Não |
| 99 | Tempestade com granizo forte | `thunderstorm-hail` | Não |
| Outro | Condição desconhecida | `unknown` | Não |

**Regras**

- Para os códigos 0, 1 e 2, usar a variante de ícone conforme `is_day`.
- Para código desconhecido, exibir “Condição desconhecida”, ícone genérico e o código bruto.
- A descrição textual é obrigatória; o ícone nunca é o único indicador da condição.
- O código bruto deve aparecer como `Código WMO {código}`.

---

### 7.9 RF-08 — Data e horário

**Regras**

- Exibir a data atual da cidade com `Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })`.
- Capitalizar apenas a primeira letra do resultado: `Quarta-feira, 17 de junho`.
- Exibir `Atualizado às HH:MM` com `Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })`.
- O valor de `current.time` é uma data/hora local sem offset. Fazer o parsing dos componentes manualmente e formatar em UTC para não deslocar o dia:
  - não usar `new Date('2026-06-17T09:45')` diretamente para exibição;
  - construir `Date.UTC(ano, mês - 1, dia, hora, minuto)` e formatar com `timeZone: 'UTC'`.
- A data e o horário devem refletir a cidade pesquisada, mesmo que ela esteja em outro fuso.
- Não exibir “Hoje” ou “Amanhã”; exibir a data concreta.
- Não atualizar automaticamente.

---

### 7.10 RF-09 — Formatação numérica e unidades

**Regras**

- Usar `Intl.NumberFormat('pt-BR')` para todos os números visíveis.
- Casas decimais:
  - temperatura principal: 0;
  - sensação térmica: 1;
  - umidade: 0;
  - probabilidade de precipitação: 0;
  - velocidade do vento: 1;
  - direção em graus: 0.
- Unidades:
  - usar as unidades de `current_units` quando presentes;
  - fallback para `°C`, `%`, `km/h` e `°`;
  - `%` e `°` são colados ao número (`92%`, `277°`);
  - `°C` e `km/h` usam espaço não separável (`19 °C`, `5,8 km/h`).
- Direção do vento:
  - normalizar 360° para 0°;
  - índice = `Math.round(graus / 22.5) % 16`;
  - usar a rosa dos ventos de 16 pontos em português.
- Não usar `toFixed()` para exibição; usar `Intl` para evitar problemas de separador decimal.

---

### 7.11 RF-10 — Estados da interface

| Estado | Quando ocorre | Conteúdo | Ação disponível |
| --- | --- | --- | --- |
| `empty` | Carga inicial; nenhuma busca feita | Empty state no cartão branco | Buscar |
| `loading` | Busca em andamento | Skeleton do layout de sucesso | Editar e buscar de novo |
| `success` | Ambas as requisições válidas | Sidebar + área principal | Nova busca |
| `city-not-found` | Geocodificação sem resultado válido | Cartão “Cidade não encontrada” | Editar busca |
| `weather-unavailable` | Cidade encontrada, clima inválido | Cartão “Clima indisponível” + cidade | Tentar novamente |
| `network-error` | Falha de rede, HTTP, JSON ou timeout | Cartão “Não foi possível conectar” | Tentar novamente |
| Validação inline (local) | Query vazia | Mensagem inline sob a busca | Corrigir e buscar |

**Regras**

- O erro de validação é local ao formulário e **não** altera o `AppState` nem substitui o conteúdo do cartão.
- O formulário de busca permanece visível em todos os estados.
- Em `city-not-found`, manter o texto digitado, focar o input e selecionar todo o texto para facilitar a correção.
- Em `weather-unavailable` e `network-error`, o botão **Tentar novamente** repete a última query do estado (e restaura o valor no input).
- Em `success`, não mover o foco para o resultado; anunciar via região `aria-live`.
- Em erros de busca (`city-not-found`, `weather-unavailable`, `network-error`), não renderizar sidebar, métricas ou valores antigos.
- O estado de loading não mostra valores falsos; apenas skeletons.
- Não usar `alert()`, modais ou toasts para erros. Tudo é inline.

---

### 7.12 RF-11 — Atribuição

- Exibir no rodapé, em todos os estados: **“Dados meteorológicos por Open-Meteo”**.
- “Open-Meteo” deve ser um link para `https://open-meteo.com/`, aberto em nova aba com `rel="noopener noreferrer"`.
- O link deve ter contraste e foco visível no fundo escuro.

---

## 8. Regras de negócio e máquina de estados

### 8.1 Máquina de estados

```text
empty ──submit válido──▶ loading
loading ──sucesso──────▶ success
loading ──sem cidade───▶ city-not-found
loading ──sem clima────▶ weather-unavailable
loading ──transporte───▶ network-error
loading ──nova busca───▶ loading (cancela a anterior)
success ──nova busca───▶ loading
city-not-found ──submit válido──▶ loading
city-not-found ──editar──▶ city-not-found (texto preservado)
weather-unavailable ──retry──▶ loading
network-error ──retry──▶ loading
qualquer ──submit vazio──▶ validação inline (estado inalterado)
recarregar página ──▶ empty
```

### 8.2 Regras transversais

- **Sem dados parciais:** a sidebar e as métricas só existem no estado `success`.
- **Sem persistência:** nenhum dado é salvo no navegador.
- **Sem busca automática:** a API só é chamada após submit explícito.
- **Sem requisições duplicadas:** a mesma query em andamento é ignorada; queries diferentes cancelam a anterior.
- **Sem retry automático:** falhas exigem ação do usuário.
- **Sem cache:** o resultado é sempre fresco (`cache: 'no-store'`).
- **Sem polling:** não há atualização periódica.
- **Idempotência:** buscar a mesma cidade novamente sempre executa o pipeline completo.

---

## 9. Requisitos de sistema e não funcionais

### 9.1 Plataforma e runtime

| Área | Requisito |
| --- | --- |
| Tipo de aplicação | SPA estática, client-side, uma única página. |
| Runtime | Navegador moderno; sem runtime Node em produção. |
| Build | Node.js 22 LTS (ou `>=20.19`) e npm. |
| Deploy | Hospedagem estática; sem backend, banco ou variáveis de ambiente. |
| Roteamento | Nenhum router; uma única rota. |
| Dependências de runtime | Nenhuma; Vite e TypeScript são usados apenas no build. |

### 9.2 Navegadores e dispositivos

- Últimas 2 versões estáveis de Chrome, Edge, Firefox e Safari.
- Safari iOS 16.4+ e Chrome Android.
- Sem suporte a Internet Explorer.
- Viewports suportados: 320 px a 1920 px, sem rolagem horizontal.
- APIs necessárias: `fetch`, `AbortController`, `Intl`, `URL`, `URLSearchParams`, CSS Grid/Flexbox e custom properties.

### 9.3 Rede e disponibilidade

- Comunicação direta com:
  - `https://geocoding-api.open-meteo.com`
  - `https://api.open-meteo.com`
- As APIs devem permitir CORS a partir do domínio da aplicação.
- Sem chave de API e sem proxy.
- Uma busca gera exatamente duas requisições GET sequenciais.
- Não há polling, prefetch ou chamadas em background.
- A disponibilidade da aplicação depende da Open-Meteo; falhas devem ser tratadas com os estados previstos.

### 9.4 Desempenho

| Métrica | Meta |
| --- | --- |
| JS + CSS iniciais | ≤ 50 KB gzip (sem contar dados da API) |
| LCP | ≤ 2,5 s em conexão 4G |
| CLS | ≤ 0,1 |
| INP | ≤ 200 ms |
| Animações | 60 fps; sem animações pesadas |
| Layout shift no loading | Zero, com skeletons de dimensões fixas |
| Requisições duplicadas | Zero por submit |

### 9.5 Acessibilidade

- Meta: **WCAG 2.2 AA**.
- Contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande e componentes de UI relevantes.
- Navegação completa por teclado, com ordem de foco lógica.
- Foco visível em todos os elementos interativos; nunca remover outline sem substituto.
- Labels acessíveis no input de busca.
- Região `aria-live` para anunciar loading, sucesso e erros.
- `aria-busy` no container de conteúdo durante o loading.
- `aria-invalid` e `aria-describedby` no input quando houver erro de validação.
- Ícones decorativos com `aria-hidden="true"`.
- Informação nunca transmitida apenas por cor: dia/noite tem texto, erros têm ícone + título + mensagem, direção do vento tem texto.
- Áreas de toque com pelo menos 44×44 px.
- Suporte a `prefers-reduced-motion`.
- Layout funcional com zoom de 200%.
- Idioma da página: `lang="pt-BR"`.

### 9.6 Segurança e privacidade

- Nenhum segredo, token ou chave no cliente.
- Nenhum `localStorage`, `sessionStorage`, cookie ou IndexedDB.
- Nenhum analytics ou rastreador.
- A query de cidade é enviada apenas para a Open-Meteo.
- Não interpolar dados da API diretamente em `innerHTML`; usar `textContent` ou escape.
- Validar todos os dados recebidos antes de renderizar.
- Links externos com `rel="noopener noreferrer"`.
- Dependências mínimas; evitar bibliotecas desnecessárias.
- Recomendado: CSP no host restringindo `connect-src` aos domínios da Open-Meteo.
- HTTPS obrigatório no deploy.

### 9.7 Internacionalização e fuso horário

- Interface 100% em pt-BR.
- API de geocodificação com `language=pt`.
- Números e datas formatados com `Intl` em `pt-BR`.
- Timezone IANA retornado pela geocodificação é usado na consulta do clima.
- A data/hora exibida é a da cidade pesquisada, não a do navegador.
- Weather codes traduzidos conforme a tabela da seção 7.8.

### 9.8 Confiabilidade

- Timeout total de 12 s por busca.
- Cancelamento de buscas anteriores.
- Proteção contra respostas fora de ordem (request id/sequência).
- Nenhuma promise rejeitada sem tratamento.
- Nenhum dado antigo permanece visível após uma nova busca.
- Erros técnicos logados no console apenas em desenvolvimento; o usuário vê mensagem amigável.

### 9.9 Manutenibilidade e qualidade

- TypeScript com `strict: true`.
- Sem `any` em contratos públicos; usar `unknown` para JSON bruto e type guards.
- Sem `enum` (o tsconfig usa `erasableSyntaxOnly`); usar uniões e objetos `as const`.
- Respeitar `verbatimModuleSyntax` com `import type` para tipos.
- Respeitar `noUnusedLocals` e `noUnusedParameters`.
- Separar API, domínio, estado e renderização.
- Todas as chamadas `fetch` da Open-Meteo concentradas em um único módulo.
- Funções puras para mapeamento, formatação e validação.
- Nomes de domínio em `camelCase`; `snake_case` apenas na fronteira da API.
- Remover todo o código e assets do template Vite que não forem usados.

### 9.10 Testes e validação

- `npm run build` deve passar sem erros de TypeScript.
- QA manual obrigatório com o checklist da seção 14.
- Recomendado: testes unitários com Vitest para funções puras:
  - normalização de query;
  - validação de cidade e clima;
  - mapeamento de resposta da API;
  - descrição de weather code;
  - formatação de data/número;
  - direção cardinal do vento.
- Recomendado: testes de serviço com `fetch` mockado para sucesso, ausência de resultados, campos inválidos, HTTP 500, JSON inválido e abort.
- Não é obrigatório framework de E2E no MVP.

### 9.11 Conformidade

- Atribuição visível à Open-Meteo.
- Dados meteorológicos da Open-Meteo sob licença CC BY 4.0.
- Descrições de weather code baseadas na tabela WMO fornecida pela Open-Meteo.

---

## 10. Detalhes técnicos

### 10.1 Stack e restrições

- **Vite** para dev server e build.
- **TypeScript** em modo estrito.
- **Vanilla TS** para estado, controle e renderização; sem React/Vue/Svelte.
- **CSS puro** com custom properties; sem framework de CSS.
- **SVG inline** para todos os ícones; sem biblioteca de ícones, icon font ou imagens externas.
- **Fontes do sistema**; sem Google Fonts.
- **Nenhuma dependência de runtime**.

### 10.2 Estrutura de arquivos sugerida

```text
src/
├─ main.ts                  # bootstrap e wiring
├─ app/
│  ├─ controller.ts         # submit, abort, timeout, transições de estado
│  └─ state.ts              # tipos de estado da aplicação
├─ services/
│  ├─ open-meteo.ts         # ÚNICO módulo com fetch para a Open-Meteo
│  └─ weather-lookup.ts     # orquestra geocodificação + clima
├─ domain/
│  ├─ types.ts              # City, CurrentWeather, WeatherSnapshot
│  ├─ weather-codes.ts      # mapa WMO + ícones
│  └─ format.ts             # data, números, unidades, vento
├─ ui/
│  ├─ render.ts             # renderização por estado
│  ├─ icons.ts              # SVGs inline
│  └─ dom.ts                # helpers seguros de DOM
└─ style.css                # tokens, layout, componentes, responsivo
```

A estrutura exata pode variar, desde que:

- exista um módulo dedicado às funções da Open-Meteo;
- nenhum outro módulo chame `fetch` diretamente;
- a renderização seja dirigida por estado;
- a separação entre API, domínio e UI seja preservada.

### 10.3 Arquitetura

```text
[formulário de busca]
        │
        ▼
[controller] ──▶ [weather-lookup] ──▶ [open-meteo] ──▶ fetch
        │                │
        │                ▼
        │          [domain/types]
        │          [domain/format]
        ▼
[AppState] ──▶ [ui/render] ──▶ DOM
```

**Responsabilidades**

- `controller`: recebe submit, normaliza query, valida, cancela busca anterior, controla timeout, chama `lookupWeather`, atualiza estado, anuncia status e gerencia foco.
- `weather-lookup`: executa geocodificação e clima em sequência; converte `null`/erros em `WeatherLookupResult`; repassa abort.
- `open-meteo`: monta URLs, executa `fetch`, valida HTTP/JSON, valida e mapeia dados para o domínio; lança erro de transporte.
- `domain`: tipos, mapa WMO, formatação e helpers puros.
- `ui`: shell, cartões, skeletons, estados, ícones e helpers de DOM seguros.
- `style.css`: tokens visuais, layout, componentes, breakpoints e motion.

### 10.4 Contrato de domínio

```ts
export type City = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type WeatherUnits = {
  temperature: string
  apparentTemperature: string
  humidity: string
  precipitationProbability: string
  windSpeed: string
  windDirection: string
}

export type CurrentWeather = {
  observedAtLocal: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitationProbability: number
  isDay: boolean
  windSpeed: number
  windDirection: number
  weatherCode: number
  units: WeatherUnits
}

export type WeatherSnapshot = {
  city: City
  weather: CurrentWeather
}

export type WeatherLookupResult =
  | { status: 'success'; data: WeatherSnapshot }
  | { status: 'city-not-found' }
  | { status: 'weather-unavailable'; cityName: string }
  | { status: 'network-error' }
```

### 10.5 Estado da aplicação

```ts
export type AppState =
  | { status: 'empty' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; data: WeatherSnapshot }
  | { status: 'city-not-found'; query: string }
  | { status: 'weather-unavailable'; query: string; cityName: string }
  | { status: 'network-error'; query: string }
```

O erro de validação do campo é local ao formulário e **não** faz parte de `AppState`; ele não substitui o conteúdo do cartão.

### 10.6 Serviço Open-Meteo

**Arquivo:** `src/services/open-meteo.ts`

**Assinaturas sugeridas**

```ts
export async function searchCity(
  name: string,
  signal?: AbortSignal,
): Promise<City | null>

export async function getCurrentWeather(
  city: City,
  signal?: AbortSignal,
): Promise<CurrentWeather | null>
```

**Regras**

- `searchCity`:
  - se `name` não for string ou estiver vazio após `trim`, retornar `null` sem fazer requisição;
  - montar URL com `URL` + `URLSearchParams`;
  - `count=1`, `language=pt`, `format=json`;
  - fazer `fetch` com `signal` e `cache: 'no-store'`;
  - validar `response.ok`;
  - parsear JSON como `unknown` e validar com type guards;
  - retornar `null` se não houver resultado válido;
  - lançar `OpenMeteoRequestError` em falha de rede, HTTP ou JSON.
- `getCurrentWeather`:
  - validar latitude, longitude e timezone antes de chamar a API;
  - se qualquer parâmetro estiver ausente/inválido, retornar `null` sem requisição;
  - montar a URL com o parâmetro `current` exatamente como especificado;
  - validar os campos obrigatórios;
  - retornar `null` se os dados forem inválidos;
  - lançar `OpenMeteoRequestError` em falha de transporte.
- O módulo não deve tomar decisões de UI.

**Erro de transporte**

```ts
export class OpenMeteoRequestError extends Error {
  readonly endpoint: 'geocoding' | 'forecast'
  readonly status?: number

  constructor(
    endpoint: 'geocoding' | 'forecast',
    status?: number,
    options?: ErrorOptions,
  ) {
    super(`Falha na requisição Open-Meteo (${endpoint})`, options)
    this.name = 'OpenMeteoRequestError'
    this.endpoint = endpoint
    this.status = status
  }
}
```

- `endpoint` identifica a etapa.
- `status` é o HTTP status, quando houver.
- `cause` preserva o erro original para log em desenvolvimento.
- A mensagem não é exibida ao usuário.

**Validação de cidade**

Aceitar apenas quando:

- `name` é string não vazia após `trim`;
- `latitude` é número finito entre -90 e 90;
- `longitude` é número finito entre -180 e 180;
- `country_code` é string não vazia;
- `timezone` é string não vazia e válida para `Intl.DateTimeFormat` (try/catch).

**Validação de clima**

Aceitar apenas quando todos os campos obrigatórios da seção 7.4 estiverem presentes e dentro das faixas. `weather_code` deve ser inteiro; valores desconhecidos são permitidos.

### 10.7 Orquestração

**Arquivo:** `src/services/weather-lookup.ts`

```ts
export async function lookupWeather(
  name: string,
  signal?: AbortSignal,
): Promise<WeatherLookupResult>
```

**Comportamento**

1. Chamar `searchCity(name, signal)`.
2. Se retornar `null` → `{ status: 'city-not-found' }`.
3. Chamar `getCurrentWeather(city, signal)`.
4. Se retornar `null` → `{ status: 'weather-unavailable', cityName: city.name }`.
5. Se ambas retornarem dados → `{ status: 'success', data: { city, weather } }`.
6. Capturar `OpenMeteoRequestError` → `{ status: 'network-error' }`.
7. Repassar `AbortError` para o controller, que decide se foi timeout ou cancelamento por nova busca.
8. Erros inesperados → `{ status: 'network-error' }` e log em desenvolvimento.

### 10.8 Controller

**Responsabilidades**

- Bind do submit do formulário.
- Normalização da query.
- Validação inline.
- Controle de `AbortController` e timeout.
- Sequência de requisições para evitar respostas fora de ordem.
- Transições de estado.
- Chamada de `render`.
- Atualização da região `aria-live`.
- Gerenciamento de foco.

**Pseudocódigo**

```ts
let activeController: AbortController | null = null
let requestId = 0

async function runSearch(rawQuery: string) {
  const query = normalizeQuery(rawQuery)

  if (!query) {
    showValidationError()
    input.focus()
    return
  }

  if (state.status === 'loading' && state.query === query) {
    return
  }

  activeController?.abort()

  const controller = new AbortController()
  activeController = controller
  const currentRequestId = ++requestId

  const timeout = window.setTimeout(() => controller.abort(), 12_000)

  setState({ status: 'loading', query })

  try {
    const result = await lookupWeather(query, controller.signal)

    if (currentRequestId !== requestId) return

    switch (result.status) {
      case 'success':
        setState({ status: 'success', query, data: result.data })
        break
      case 'city-not-found':
        setState({ status: 'city-not-found', query })
        break
      case 'weather-unavailable':
        setState({
          status: 'weather-unavailable',
          query,
          cityName: result.cityName,
        })
        break
      case 'network-error':
        setState({ status: 'network-error', query })
        break
    }
  } catch {
    if (currentRequestId !== requestId) return

    setState({ status: 'network-error', query })
  } finally {
    window.clearTimeout(timeout)

    if (currentRequestId === requestId) {
      activeController = null
    }
  }
}
```

> O pseudocódigo é ilustrativo. A implementação deve garantir que abort por nova busca não seja exibido como erro, usando o `requestId` antes de atualizar o estado. Timeout e erros inesperados da busca atual resultam em `network-error`.

### 10.9 Renderização

**Shell persistente**

O formulário de busca não deve ser recriado a cada estado. O shell contém:

```text
<header class="search-area">
  <h1 class="sr-only">Clima</h1>
  <form role="search" novalidate>
    <label class="sr-only" for="city">Nome da cidade</label>
    <div class="search-control">
      <svg aria-hidden="true">...</svg>
      <input id="city" type="search" maxlength="80" ... />
      <button type="submit">Buscar</button>
    </div>
  </form>
  <p class="field-error" role="alert" hidden>...</p>
</header>
<main id="content" aria-busy="false">...</main>
<footer>...</footer>
<p id="status" class="sr-only" role="status"></p>
```

Apenas o conteúdo de `#content` é substituído a cada transição de estado. Assim, o input mantém valor e foco.

**Segurança de renderização**

- Preferir `document.createElement` + `textContent` para textos vindos da API ou do usuário.
- Se forem usados templates com `innerHTML`, toda string dinâmica deve passar por um `escapeHtml` central.
- Nunca interpolar `city.name`, `query` ou qualquer campo da API diretamente em HTML.
- Valores de atributos (`aria-label`, `title`) também devem ser definidos por propriedade/`setAttribute` com dados já validados, ou escapados.
- Inputs devem ter valor definido via `input.value`, não via HTML.

**Região de status**

Mensagens curtas para leitores de tela:

| Evento | Mensagem |
| --- | --- |
| Loading | `Buscando clima para {query}.` |
| Sucesso | `Clima de {city} carregado.` |
| Cidade não encontrada | `Cidade não encontrada para {query}.` |
| Clima indisponível | `Clima indisponível para {city}.` |
| Erro de conexão | `Não foi possível conectar ao serviço de clima.` |

A região não deve repetir todo o conteúdo do cartão.

### 10.10 Parsing e formatação

**Data/hora local**

```ts
function parseLocalIso(value: string): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)

  if (!match) return null

  const [, year, month, day, hour, minute] = match
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  )
}
```

Formatar com `timeZone: 'UTC'` para preservar a hora local da cidade.

**Direção do vento**

```ts
const CARDINALS = [
  'N', 'NNE', 'NE', 'ENE',
  'L', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO',
  'O', 'ONO', 'NO', 'NNO',
] as const

function degreesToCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.round(normalized / 22.5) % 16
  return CARDINALS[index] ?? 'N'
}
```

**Unidades**

```ts
function joinValueAndUnit(value: string, unit: string): string {
  if (unit === '%' || unit === '°') return `${value}${unit}`
  return `${value}\u00A0${unit}`
}
```

### 10.11 Fetch, timeout e cancelamento

- Um `AbortController` por busca; o mesmo signal é passado para as duas requisições.
- Timeout total de 12 s com `setTimeout`; o timer é limpo no `finally`.
- Uma nova busca chama `abort()` na anterior antes de criar a nova.
- Respostas de buscas antigas são descartadas via `requestId`.
- Abort por nova busca não gera UI de erro.
- Abort por timeout gera `network-error`.
- `AbortError` não deve ser convertido em `OpenMeteoRequestError`: ele é repassado ao controller para distinguir cancelamento de falha de transporte.
- `fetch` com `cache: 'no-store'` e header `Accept: application/json`.
- Verificar `response.ok`; erros HTTP viram `OpenMeteoRequestError`.
- JSON inválido vira `OpenMeteoRequestError`.
- Nenhuma chamada de rede fora de `open-meteo.ts`.

### 10.12 Tipagem e tsconfig

- Adicionar `"strict": true` ao `tsconfig.json`.
- Manter as flags existentes:
  - `noUnusedLocals`;
  - `noUnusedParameters`;
  - `erasableSyntaxOnly`;
  - `noFallthroughCasesInSwitch`.
- Usar `unknown` para JSON bruto e type guards.
- Não usar `enum`; usar uniões literais e objetos `as const`.
- Usar `import type` para tipos, por causa de `verbatimModuleSyntax`.
- Evitar casts (`as`) em dados da API; preferir guards.
- Funções de formatação e mapeamento devem ser puras e testáveis.

### 10.13 Limpeza do template

- Remover o conteúdo demo de `src/main.ts`.
- Remover `src/counter.ts` se não for usado.
- Remover `src/assets/hero.png`, `typescript.svg` e `vite.svg` se não forem usados.
- Remover referências ao `public/icons.svg` do template.
- Substituir o favicon padrão por um favicon de clima simples em SVG.
- Atualizar `index.html`:
  - `lang="pt-BR"`;
  - título “Clima — Condições atuais por cidade”;
  - meta description;
  - `theme-color` `#1b1f27`;
  - CSS `color-scheme: light` para manter os controles nativos claros.

### 10.14 Build e deploy

- `npm run dev` para desenvolvimento.
- `npm run build` executa `tsc && vite build`; deve passar sem erros.
- `npm run preview` para validar o build.
- Deploy estático em qualquer host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
- Sem variáveis de ambiente.
- Se o deploy for em subpath, configurar `base` no Vite.
- Não é necessário fallback de SPA, pois há apenas uma rota.

---

## 11. Instruções visuais

### 11.1 Princípios

- **Foco no essencial:** temperatura é o elemento mais forte; cidade e condição vêm em seguida; métricas são secundárias.
- **Contraste alto:** fundo escuro, cartão branco, texto escuro.
- **Calma:** sem gradientes chamativos, sem animações de fundo, sem excesso de cores.
- **Consistência:** todos os ícones seguem a mesma linguagem de traço.
- **Clareza:** cada estado tem uma mensagem e, quando aplicável, uma ação.
- **Responsividade real:** o layout se reorganiza, não apenas encolhe.

### 11.2 Layout desktop (≥ 721 px)

```text
┌──────────────────────────── viewport — fundo #1B1F27 ────────────────────────────┐
│                                                                                  │
│                         ┌──────── busca — 560 px ────────┐                       │
│                         │ [lupa] Digite o nome... [Buscar] │                      │
│                         └─────────────────────────────────┘                      │
│                                                                                  │
│          ┌──────────────────── cartão — 800 px, raio 28 px ─────────────────┐    │
│          │ sidebar — 280 px          │ área principal                        │    │
│          │                           │                                       │    │
│          │ 19 °C                     │ ┌──────────────┐ ┌──────────────┐     │    │
│          │ Rio de Janeiro, BR        │ │ Umidade      │ │ Sensação     │     │    │
│          │ Quarta-feira, 17 de junho │ │ 92%          │ │ 21,4 °C      │     │    │
│          │ Dia · Atualizado 09:45    │ └──────────────┘ └──────────────┘     │    │
│          │                           │ ┌──────────────┐ ┌──────────────┐     │    │
│          │ [ícone]                   │ │ Precipitação │ │ Vento        │     │    │
│          │ Parcialmente nublado      │ │ 73%          │ │ 5,8 km/h     │     │    │
│          │ Código WMO 2              │ │              │ │ de O · 277°  │     │    │
│          │                           │ └──────────────┘ └──────────────┘     │    │
│          └───────────────────────────┴───────────────────────────────────────┘    │
│                                                                                  │
│                     Dados meteorológicos por Open-Meteo                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Medidas**

- Página: `min-height: 100svh`, padding `48px 24px 32px`.
- Busca: `width: min(560px, 100%)`, centralizada.
- Cartão: `width: min(800px, 100%)`, centralizado.
- Grid do cartão de sucesso: `280px minmax(0, 1fr)`.
- Sidebar: `padding: 32px`; `border-right: 1px solid var(--border)`.
- Área principal: `padding: 32px`.
- Rodapé: `margin-top: auto`, `padding-top: 24px`.

### 11.3 Layout mobile (≤ 720 px)

```text
viewport 360 px
┌ busca (100%) ───────────────────────┐
│ [lupa] Cidade...        [Buscar]    │
└─────────────────────────────────────┘

cartão (100%)
┌─────────────────────────────────────┐
│ 19 °C                     [Dia]     │
│ Rio de Janeiro, BR                  │
│ Quarta-feira, 17 de junho           │
│ Atualizado às 09:45                 │
│ [ícone] Parcialmente nublado        │
│ Código WMO 2                        │
├─────────────────────────────────────┤
│ [ícone] Umidade relativa      92%   │
│ [ícone] Sensação térmica      21,4 °C│
│ [ícone] Precipitação          73%   │
│ [ícone] Vento                 5,8 km/h│
│                             de O · 277°│
└─────────────────────────────────────┘
Dados meteorológicos por Open-Meteo
```

> Os diagramas são esquemáticos. O copy deck da seção 11.10 é a fonte de verdade dos rótulos finais; “Precipitação” no diagrama representa “Probabilidade de precipitação”.

**Regras**

- Em `max-width: 720px`:
  - sidebar vira bloco superior;
  - `border-right: none`;
  - `border-bottom: 1px solid var(--border)`;
  - cartão passa a uma coluna;
  - sidebar usa padding `24px`;
  - o bloco de clima usa ícone de 48 px.
- Em `max-width: 560px`:
  - métricas passam para uma coluna;
  - tiles viram linhas horizontais: ícone à esquerda, label/valor à direita;
  - temperatura principal vai para 52 px;
  - cartão com raio 22 px;
  - página com padding `24px 16px`;
  - busca com altura 52 px;
  - empty/error com padding `32px 24px`.
- Em `max-width: 380px`, reduzir padding horizontal do botão e manter o texto “Buscar” visível.
- Não deve haver scroll horizontal em 320 px.

### 11.4 Tokens de design

```css
:root {
  color-scheme: light;

  /* Superfícies */
  --bg: #1b1f27;
  --surface: #ffffff;
  --surface-subtle: #f7f8fa;
  --border: #e6e8ee;
  --border-subtle: #eef0f4;

  /* Texto */
  --text: #101828;
  --text-secondary: #475467;
  --text-muted: #667085;
  --text-on-dark: #aab2c0;

  /* Ação */
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-soft: #eff4ff;
  --focus: #2563eb;
  --focus-on-dark: #93c5fd;

  /* Estados */
  --danger: #b42318;
  --danger-soft: #fef3f2;
  --danger-on-dark: #fda29b;
  --warning: #b54708;
  --warning-soft: #fffaeb;
  --day: #b45309;
  --day-soft: #fff7e6;
  --night: #4338ca;
  --night-soft: #eef2ff;

  /* Skeleton */
  --skeleton: #e9ecf1;
  --skeleton-highlight: #f4f6f9;

  /* Formas */
  --radius-card: 28px;
  --radius-panel: 18px;
  --radius-control: 14px;
  --radius-pill: 999px;

  /* Sombras */
  --shadow-card:
    0 30px 80px rgba(5, 10, 20, 0.45),
    0 2px 8px rgba(5, 10, 20, 0.24);
  --shadow-search: 0 10px 30px rgba(0, 0, 0, 0.18);

  /* Tipografia */
  --font-sans:
    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    sans-serif;

  /* Movimento */
  --transition: 180ms ease-out;
}
```

**Contraste esperado**

- `--text` sobre `--surface`: alto contraste.
- `--text-secondary` sobre `--surface`: ≥ 7:1.
- `--text-muted` sobre `--surface`: ≥ 4,5:1.
- `--text-on-dark` sobre `--bg`: ≥ 7:1.
- `--accent` sobre `--surface`: ≥ 4,5:1; texto branco sobre `--accent`: ≥ 4,5:1.
- `--danger-on-dark` sobre `--bg`: ≥ 7:1.
- Badges dia/noite: ≥ 4,5:1.
- Foco: ≥ 3:1 contra o fundo adjacente.

### 11.5 Escala tipográfica

| Uso | Tamanho / linha | Peso | Detalhes |
| --- | --- | --- | --- |
| Temperatura principal | 64 / 64 px | 600 | `-0.04em`, `tabular-nums`; 52 px no mobile |
| Unidade da temperatura | 24 / 24 px | 500 | Alinhada ao topo do número |
| Cidade | 20 / 26 px | 600 | Quebra de linha permitida |
| Data | 14 / 20 px | 400 | `--text-secondary` |
| Atualizado às | 12 / 16 px | 400 | `--text-muted` |
| Badge dia/noite | 12 / 16 px | 600 | Pill com ícone 14 px |
| Descrição do clima | 17 / 24 px | 500 | `--text` |
| Código WMO | 12 / 16 px | 500 | `--text-muted` |
| Valor de métrica | 30 / 34 px | 600 | `tabular-nums`; 26/30 no mobile |
| Label de métrica | 12 / 16 px | 600 | Uppercase, `0.06em`, `--text-muted` |
| Texto secundário da métrica | 13 / 18 px | 400 | `--text-secondary` |
| Botão | 15 / 20 px | 600 | — |
| Input | 16 / 24 px | 400 | Evita zoom automático no iOS |
| Empty title | 24 / 30 px | 600 | — |
| Empty body | 15 / 22 px | 400 | Máx. 360 px de largura |
| Error title | 22 / 28 px | 600 | — |
| Error body | 15 / 22 px | 400 | Máx. 420 px |
| Rodapé | 12 / 16 px | 400 | `--text-on-dark` |

### 11.6 Componentes

#### Página

- Fundo `--bg`.
- Conteúdo centralizado.
- `box-sizing: border-box` global.
- `min-width: 320px`.
- `body { margin: 0 }`.
- Sem imagens de fundo.

#### Área de busca

- Sem background próprio; apenas o controle branco sobre o fundo escuro.
- Largura máxima 560 px, centralizada.
- Controle:
  - altura 56 px no desktop e 52 px no mobile;
  - fundo branco;
  - raio 16 px;
  - sombra `--shadow-search`;
  - ícone de lupa 20 px à esquerda;
  - input flexível, sem borda;
  - botão à direita com 44 px de altura, raio 12 px, fundo `--accent`, texto branco;
  - padding interno de 6 px à direita.
- Focus:
  - `:focus-within` no controle com `outline: 2px solid var(--focus-on-dark)` e `outline-offset: 2px`;
  - nunca remover o foco do input sem substituto.
- Erro inline:
  - 8 px abaixo do controle;
  - 13 px;
  - cor `--danger-on-dark`;
  - ícone de alerta 16 px;
  - `role="alert"`.

#### Cartão

- `width: min(800px, 100%)`.
- Fundo branco.
- Raio 28 px (22 px no mobile).
- Sombra `--shadow-card`.
- `overflow: hidden`.
- Sucesso: `min-height: 420px`.
- Empty/erro: `min-height: 360px`.
- Sucesso desktop: grid de duas colunas.
- Empty/erro: uma coluna, conteúdo centralizado, padding 48 px.
- Loading: mesmo grid do sucesso, com skeletons.

#### Sidebar

- `padding: 32px`.
- `display: flex; flex-direction: column; gap: 24px`.
- Divisória à direita.
- Bloco de temperatura:
  - valor 64 px;
  - unidade 24 px;
  - alinhamento superior.
- Cidade:
  - 20 px;
  - código do país em `--text-muted`;
  - `overflow-wrap: anywhere`.
- Data e atualização:
  - data em `--text-secondary`;
  - horário em `--text-muted`.
- Badge dia/noite:
  - pill;
  - padding `4px 10px`;
  - gap 6 px;
  - ícone 14 px;
  - dia: fundo `--day-soft`, texto `--day`;
  - noite: fundo `--night-soft`, texto `--night`.
- Bloco de clima:
  - `margin-top: auto`;
  - `border-top: 1px solid var(--border-subtle)`;
  - `padding-top: 20px`;
  - ícone 64 px;
  - descrição 17 px;
  - código 12 px.
- No mobile:
  - `border-right: none`;
  - `border-bottom`;
  - `margin-top: 0`;
  - ícone 48 px;
  - gaps menores (16 px).

#### Área principal

- `padding: 32px`.
- Grid 2×2 com gap 16 px.
- `align-content: center`.
- Sem scroll interno.
- Cada tile:
  - fundo `--surface-subtle`;
  - borda 1 px `--border-subtle`;
  - raio 18 px;
  - padding 20 px;
  - `min-height: 128px`;
  - flex column, gap 12 px.
- Ícone:
  - container 36×36 px;
  - raio 12 px;
  - fundo `--accent-soft`;
  - ícone 20 px em `--accent`.
- Label:
  - 12 px uppercase;
  - `--text-muted`.
- Valor:
  - 30 px;
  - `--text`;
  - `tabular-nums`.
- Secundário:
  - 13 px;
  - `--text-secondary`.
- Mobile ≤ 560:
  - grid de uma coluna;
  - tile horizontal;
  - padding 16 px;
  - `min-height: auto`;
  - ícone à esquerda, texto à direita.

#### Empty state

- Cartão branco de 800 px, centralizado, `min-height: 360px`.
- Conteúdo centralizado, padding 48 px.
- Ícone:
  - círculo 88 px;
  - fundo `--accent-soft`;
  - ícone 44 px em `--accent`.
- Título 24 px.
- Texto 15 px, largura máxima 360 px, `--text-secondary`.
- Dica: “Ex.: São Paulo, Lisboa ou Tóquio” em 13 px, `--text-muted`.
- Sem valores ou placeholders de dados reais.

#### Loading

- Mesmo cartão do sucesso, com skeleton.
- Sidebar:
  - bloco 120×64 para temperatura;
  - linha 180×20 para cidade;
  - linha 160×14 para data;
  - pill 80×24;
  - círculo 64 px + linha 140×20 para clima.
- Área principal:
  - quatro tiles de 100% × 128 px.
- Skeleton:
  - fundo `--skeleton`;
  - animação de pulso até `--skeleton-highlight` a cada 1,4 s;
  - desativar animação em `prefers-reduced-motion`.
- Sem números falsos.
- Botão com spinner 16 px + texto “Buscando…”.
- Manter dimensões finais para evitar CLS.

#### Erros

- Cartão branco de 800 px, `min-height: 360px`, conteúdo centralizado, padding 48 px.
- Ícone em círculo 56 px.
- Título 22 px.
- Mensagem 15 px, largura máxima 420 px.
- Ação **Tentar novamente** para erros de clima/rede.
- Cidade não encontrada:
  - ícone neutro `map-pin-off`;
  - fundo `--surface-subtle`;
  - sem botão de retry;
  - o usuário corrige a busca.
- Clima indisponível:
  - ícone `cloud-off`;
  - fundo `--warning-soft`;
  - cor `--warning`;
  - botão de retry.
- Erro de conexão:
  - ícone `wifi-off`;
  - fundo `--danger-soft`;
  - cor `--danger`;
  - botão de retry.
- Os erros nunca são comunicados apenas por cor.

#### Rodapé

- Centralizado.
- 12 px.
- `--text-on-dark`.
- Link “Open-Meteo” com sublinhado no hover.
- Foco visível com `--focus-on-dark`.
- Presente em todos os estados.

### 11.7 Ícones

- Todos os ícones são SVG inline, sem dependências.
- Ícones utilitários:
  - viewBox 24×24;
  - `fill="none"`;
  - `stroke="currentColor"`;
  - `stroke-width="1.75"`;
  - `stroke-linecap="round"`;
  - `stroke-linejoin="round"`.
- Ícones de clima:
  - viewBox 64×64;
  - `stroke-width="1.5"`;
  - mesma linguagem visual.
- Tamanhos:
  - busca: 20 px;
  - métricas: 20 px;
  - badge dia/noite: 14 px;
  - clima na sidebar: 64 px (48 px no mobile);
  - empty state: 44 px;
  - erro: 28 px.
- Cores:
  - ícones de métricas e clima: `--accent`;
  - dia: `--day`; noite: `--night`;
  - erro: cor do estado;
  - ícones decorativos: `aria-hidden="true"`.
- Conjunto mínimo:
  - `search`, `sun`, `moon`, `cloud-sun`, `cloud-moon`, `cloud`, `fog`, `drizzle`, `freezing-drizzle`, `rain`, `freezing-rain`, `snow`, `snow-grains`, `rain-showers`, `snow-showers`, `thunderstorm`, `thunderstorm-hail`, `unknown`;
  - `droplet`, `thermometer`, `umbrella`, `wind`;
  - `map-pin-off`, `cloud-off`, `wifi-off`;
  - `alert-circle`, `refresh`, `spinner`.
- Não usar emojis.

### 11.8 Movimento

- Transição de conteúdo: fade + `translateY(4px)` em 180 ms `ease-out`.
- Skeleton: pulso de 1,4 s `ease-in-out` infinito.
- Spinner: rotação de 700 ms linear.
- Hover do botão: escurecer `--accent` para `--accent-hover`.
- Sem animações de fundo, parallax ou auto-scroll.
- Em `prefers-reduced-motion: reduce`:
  - remover transições e pulso;
  - spinner estático;
  - manter toda a informação visível.

### 11.9 Foco e estados interativos

- `:focus-visible`:
  - `outline: 2px solid var(--focus)`;
  - `outline-offset: 2px`.
- Em elementos sobre o fundo escuro:
  - `outline-color: var(--focus-on-dark)`.
- Botão:
  - hover: `--accent-hover`;
  - active: leve redução de brilho, sem mudar dimensões;
  - o input e o botão não são desabilitados durante o loading; o botão permanece focável.
- Link:
  - sublinhado no hover/focus;
  - sem remover o foco.
- Nenhum estado depende apenas de cor.

### 11.10 Copy deck

| Chave | Texto |
| --- | --- |
| `page.title` | Clima — Condições atuais por cidade |
| `page.description` | Consulte as condições atuais de temperatura, umidade, vento e chuva de qualquer cidade. |
| `search.label` | Nome da cidade |
| `search.placeholder` | Digite o nome da cidade |
| `search.submit` | Buscar |
| `search.loading` | Buscando… |
| `search.emptyError` | Digite o nome de uma cidade. |
| `empty.title` | Como está o clima hoje? |
| `empty.body` | Busque por uma cidade para ver temperatura, umidade, vento e chance de chuva. |
| `empty.hint` | Ex.: São Paulo, Lisboa ou Tóquio |
| `loading.status` | Buscando clima para {query}. |
| `success.status` | Clima de {city} carregado. |
| `sidebar.updated` | Atualizado às {time} |
| `sidebar.day` | Dia |
| `sidebar.night` | Noite |
| `sidebar.weatherCode` | Código WMO {code} |
| `metric.humidity` | Umidade relativa |
| `metric.apparent` | Sensação térmica |
| `metric.precipitation` | Probabilidade de precipitação |
| `metric.wind` | Vento |
| `metric.windDirection` | de {direction} · {degrees}° |
| `error.cityNotFound.title` | Cidade não encontrada |
| `error.cityNotFound.body` | Não encontramos resultados para “{query}”. Verifique o nome e tente novamente. |
| `error.weatherUnavailable.title` | Clima indisponível |
| `error.weatherUnavailable.body` | Encontramos {city}, mas não conseguimos obter os dados de clima agora. Tente novamente. |
| `error.network.title` | Não foi possível conectar |
| `error.network.body` | Verifique sua conexão com a internet e tente novamente. |
| `error.retry` | Tentar novamente |
| `attribution` | Dados meteorológicos por Open-Meteo |

**Placeholders**

- `{query}`: texto digitado pelo usuário, escapado.
- `{city}`: nome canônico da cidade, escapado.
- `{time}`: horário local no formato `HH:MM`.
- `{direction}`: cardinal de 16 pontos.
- `{degrees}`: graus arredondados para inteiro.
- `{code}`: código WMO bruto.

---

## 12. Critérios de aceite

| ID | Dado | Quando | Então |
| --- | --- | --- | --- |
| AC-01 | O app é aberto pela primeira vez | Nenhuma busca foi feita | Exibe busca no topo e empty state; nenhuma requisição é feita; input vazio. |
| AC-02 | A cidade “Rio de Janeiro” é buscada com os dados de exemplo | O submit é disparado | Exibe loading único; depois sidebar com `19 °C`, `Rio de Janeiro, BR`, `Quarta-feira, 17 de junho`, `Dia`, `Parcialmente nublado`, `Código WMO 2`; e métricas `92%`, `21,4 °C`, `73%`, `5,8 km/h`, `de O · 277°`. |
| AC-03 | Uma cidade válida é digitada | O usuário pressiona Enter | A busca é disparada exatamente como pelo botão. |
| AC-04 | O input está vazio ou só com espaços | O usuário tenta buscar | Nenhuma requisição; mensagem “Digite o nome de uma cidade.”; foco no input; conteúdo atual permanece. |
| AC-05 | A geocodificação não retorna resultados | A busca termina | Cartão “Cidade não encontrada”; nenhum dado de clima é exibido; input mantém o texto e recebe foco. |
| AC-06 | A cidade é encontrada, mas o clima retorna dados inválidos/ausentes | A busca termina | Cartão “Clima indisponível” com o nome da cidade; nenhuma métrica é exibida; botão “Tentar novamente” disponível. |
| AC-07 | Há falha de rede, HTTP ou JSON inválido | A busca termina | Cartão “Não foi possível conectar”; nenhuma métrica parcial; botão “Tentar novamente” disponível. |
| AC-08 | A busca excede 12 segundos | O timeout dispara | Requisição é abortada; erro de conexão é exibido; UI volta a permitir nova busca. |
| AC-09 | Uma segunda busca é disparada durante a primeira | A primeira resposta chega depois | A primeira é ignorada; apenas o resultado da segunda é renderizado. |
| AC-10 | Um erro de clima/rede está visível | O usuário clica em “Tentar novamente” | A mesma query é reenviada; loading é exibido; input é restaurado para a query do erro. |
| AC-11 | O app é recarregado após um sucesso | A página carrega | Empty state é exibido; nenhum dado é restaurado de storage ou URL. |
| AC-12 | Cidades com weather codes de todos os grupos são consultadas | O resultado é renderizado | Descrição pt-BR, ícone correto e código bruto são exibidos conforme a tabela 7.8. |
| AC-13 | A API retorna um weather code desconhecido | O resultado é renderizado | Exibe “Condição desconhecida”, ícone genérico e o código bruto; não falha o resultado. |
| AC-14 | Os números e a data são formatados | O resultado é renderizado | Números usam vírgula decimal; unidades corretas; data em pt-BR com capitalização inicial; vento usa cardinal de 16 pontos + graus. |
| AC-15 | O app é aberto em 320, 360, 720, 768 e 1280 px | A janela é redimensionada | Não há scroll horizontal; em 768 px o layout mantém duas colunas; em 720 px a sidebar empilha; em 560 px as métricas empilham; todos os conteúdos permanecem legíveis. |
| AC-16 | O usuário navega apenas por teclado | Tab/Enter são usados | Busca, botão, retry e link são acessíveis; foco é visível; loading e resultados são anunciados; o erro de validação é associado ao input. |
| AC-17 | Um nome de cidade contém caracteres HTML | O resultado é renderizado | O texto é exibido literalmente; nenhum script é executado; nenhum HTML é injetado. |
| AC-18 | O app é carregado | Qualquer estado | O rodapé exibe “Dados meteorológicos por Open-Meteo” com link funcional e seguro. |
| AC-19 | `npm run build` é executado | O comando termina | Build conclui sem erros de TypeScript. |
| AC-20 | O código é inspecionado | A implementação está concluída | Nenhuma chamada `fetch` à Open-Meteo existe fora de `src/services/open-meteo.ts`; não há `localStorage`/cookies; não há template demo. |

---

## 13. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Indisponibilidade ou latência da Open-Meteo | Usuário sem dados | Estados de erro claros, timeout de 12 s, retry manual, sem polling. |
| Rate limit da API gratuita | Buscas bloqueadas temporariamente | Uma dupla de requisições por submit; sem prefetch/polling; mensagem de erro amigável. |
| Ambiguidade de nomes com `count=1` | Cidade errada ou não encontrada | Copiar orienta refinar o nome; não há seleção de múltiplos resultados no MVP. |
| Erro de fuso/data | Dia exibido incorretamente | Parsing manual de `current.time` e formatação em UTC; testes com datas de exemplo. |
| Nome de cidade com HTML/script | XSS | Renderização com `textContent`/escape; validação de tipos; nenhuma interpolação direta em `innerHTML`. |
| Nome de cidade muito longo | Overflow/quebra de layout | `overflow-wrap: anywhere`, limite de 2 linhas quando necessário, teste com nomes longos. |
| Contraste insuficiente | Falha de acessibilidade | Tokens com contraste verificado; auditoria Lighthouse/axe. |
| Layout shift no loading | Experiência ruim | Skeletons com dimensões fixas iguais ao layout final. |
| Flash de skeleton em respostas rápidas | Percepção de lentidão | Aceitável no MVP; não adicionar atraso artificial; transição suave. |
| Mudança de contrato da API | Dados inválidos | Validação na fronteira; falha segura para `weather-unavailable`/`network-error`. |
| CORS ou bloqueio de rede | App sem dados | Testar em produção; erro de conexão; documentar dependência da API. |
| Escopo crescer para previsão diária | Atraso no MVP | Lista explícita de fora de escopo; mudanças exigem nova versão. |
| Resquícios do template Vite | Poluição visual/código morto | Limpeza obrigatória no DoD. |
| Diferenças de `Intl` entre navegadores | Datas/números inconsistentes | Testar Chrome, Firefox e Safari; usar formatadores padrão. |

---

## 14. Checklist de QA manual

### Funcional

- [ ] Empty state inicial sem requisição.
- [ ] Busca por Enter.
- [ ] Busca pelo botão.
- [ ] Query vazia exibe erro inline e não chama a API.
- [ ] Query com espaços extras é normalizada.
- [ ] Busca válida exibe loading único e depois sucesso.
- [ ] Cidade inexistente exibe “Cidade não encontrada”.
- [ ] Cidade encontrada + clima inválido exibe “Clima indisponível”.
- [ ] Falha de rede exibe “Não foi possível conectar”.
- [ ] Timeout exibe erro de conexão e permite nova busca.
- [ ] Duas buscas rápidas: apenas a última renderiza.
- [ ] Retry repete a query correta.
- [ ] Nova busca substitui completamente o resultado anterior.
- [ ] Recarregar a página volta ao empty state.
- [ ] Nenhum dado é salvo em `localStorage`, `sessionStorage`, cookies ou URL.

### Dados e formatação

- [ ] Temperatura principal arredondada.
- [ ] Sensação térmica com 1 casa decimal.
- [ ] Umidade e precipitação inteiras.
- [ ] Vento com 1 casa decimal.
- [ ] Direção cardinal de 16 pontos + graus.
- [ ] Unidades vindas de `current_units`.
- [ ] Data/hora da cidade corretas, inclusive em fuso diferente do navegador.
- [ ] Todos os weather codes da tabela 7.8.
- [ ] Weather code desconhecido não quebra a tela.
- [ ] Dia/noite reflete `is_day`.

### Visual e responsivo

- [ ] 320 px sem scroll horizontal.
- [ ] 360 px sem scroll horizontal.
- [ ] 768 px com layout de duas colunas.
- [ ] 720 px com sidebar empilhada.
- [ ] 1280 px com layout de duas colunas.
- [ ] Nome de cidade longo não vaza do cartão.
- [ ] Skeletons sem layout shift.
- [ ] Empty, loading, sucesso e erros visualmente distintos.
- [ ] Rodapé com atribuição em todos os estados.
- [ ] Zoom de 200% sem perda de conteúdo.
- [ ] `prefers-reduced-motion` desativa animações.

### Acessibilidade

- [ ] Navegação completa por Tab/Shift+Tab.
- [ ] Foco visível em todos os interativos.
- [ ] Input com label acessível.
- [ ] Erro inline associado via `aria-describedby`/`aria-invalid`.
- [ ] Região `aria-live` anuncia loading, sucesso e erros.
- [ ] `aria-busy` durante loading.
- [ ] Ícones decorativos com `aria-hidden`.
- [ ] Contraste AA verificado.
- [ ] Informação não depende apenas de cor.
- [ ] Leitor de tela consegue ler cidade, data, condição e métricas.
- [ ] Link externo com `rel="noopener noreferrer"`.

### Técnico

- [ ] `npm run build` sem erros.
- [ ] `strict: true` habilitado.
- [ ] Sem `any` em contratos públicos.
- [ ] Nenhum `fetch` fora de `open-meteo.ts`.
- [ ] Nenhum erro no console em fluxo normal.
- [ ] Nenhum asset/template demo restante.
- [ ] `lang="pt-BR"`, título e meta description corretos.
- [ ] Favicon substituído.

---

## 15. Premissas e dependências

- Os endpoints e parâmetros da Open-Meteo descritos neste documento permanecem estáveis.
- As APIs permitem chamadas diretas do navegador via CORS.
- O uso da API gratuita é suficiente para o MVP, sem chave.
- As unidades retornadas são métricas (°C, %, km/h), pois o request não solicita conversão.
- O usuário tem conexão com a internet.
- O app é usado em navegador moderno.
- A interface é apenas em pt-BR.
- Não há backend, autenticação, banco ou analytics.
- Não há persistência de dados.
- A condição exibida é uma fotografia do momento da busca, não um feed em tempo real.

---

## 16. Definition of Done

### Produto

- [ ] Todos os requisitos **Must** implementados.
- [ ] Todos os estados da seção 7.11 implementados.
- [ ] Erros distintos, com mensagens e ações corretas.
- [ ] Nenhum dado meteorológico parcial em tela.
- [ ] Weather codes completos conforme a tabela 7.8.
- [ ] Formatação pt-BR e unidades corretas.
- [ ] Atribuição à Open-Meteo.

### Técnico (entrega)

- [ ] TypeScript estrito, sem `any` em contratos.
- [ ] Todas as chamadas Open-Meteo em `src/services/open-meteo.ts`.
- [ ] Orquestração separada em `weather-lookup.ts`.
- [ ] Estado dirigido por `AppState`.
- [ ] Timeout, abort e proteção contra respostas fora de ordem.
- [ ] Renderização segura contra XSS.
- [ ] Sem persistência, cache de aplicação, polling ou retry automático.
- [ ] `npm run build` passa.
- [ ] Sem erros no console em fluxo normal.
- [ ] Template Vite removido.

### Visual

- [ ] Tokens da seção 11.4 aplicados.
- [ ] Layout desktop e mobile conforme diagramas.
- [ ] Empty, loading, sucesso e erros conforme especificação.
- [ ] SVG inline, sem emojis ou bibliotecas de ícones.
- [ ] Foco visível e `prefers-reduced-motion`.
- [ ] Contraste AA.
- [ ] Sem scroll horizontal em 320 px.

### QA

- [ ] Checklist da seção 14 concluído.
- [ ] Critérios de aceite da seção 12 validados.
- [ ] Teste com dados de exemplo (Rio de Janeiro).
- [ ] Teste em Chrome, Firefox e Safari (ou equivalentes).
- [ ] Teste com leitor de tela em pelo menos um fluxo (busca + erro).

---

## 17. Decisões registradas

| Tema | Decisão | Justificativa |
| --- | --- | --- |
| Idioma | Interface 100% em pt-BR | Público brasileiro; API já é consultada com `language=pt`. |
| Falhas | Mensagens distintas + empty state | Melhor orientação do que um erro genérico, sem exibir dados parciais. |
| Busca | Enter + botão **Buscar** | Descoberta e acessibilidade; botão explícito. |
| Mobile | Sidebar vira bloco superior | Mantém legibilidade e evita colunas apertadas. |
| Ícones | SVG inline próprios | Sem dependências, controle visual e consistência. |
| Persistência | Nenhuma | MVP simples e previsível; recarregar volta ao empty state. |
| `weather_code` | Obrigatório | A sidebar exige a condição; a lista original do brain dump não o incluía, mas ele é necessário. |
| `precipitation` | Solicitado, não exibido | Mantém o contrato original da URL; não há requisito visual para o volume. |
| Unidades | `current_units` com fallback | Exibe o que a API informa, sem quebrar por campo cosmético ausente. |
| Casas decimais | Temperatura 0; sensação 1; vento 1; umidade/precipitação 0 | Equilíbrio entre precisão e legibilidade. |
| Direção do vento | 16 pontos + graus, origem | Precisão e clareza; “de O · 277°”. |
| Data | `current.time` local + parsing manual | Evita deslocamento de dia por conversão de fuso do navegador. |
| Timeout | 12 s total | Cobre duas requisições sequenciais sem espera excessiva. |
| Retry | Manual, sem automático | Evita rate limit e loops; usuário controla. |
| Cache | `no-store`, sem cache de app | Dados atuais; simplicidade. |
| Busca durante loading | Input editável; mesma query ignorada; query diferente cancela | Mantém controle do usuário e evita requisições duplicadas. |
| Atualização | Sem auto-refresh | Fora do escopo; o horário do dado informa a atualidade. |
| País | Apenas código, em maiúsculas | Requisito do brain dump; nome do país não é necessário. |
| Tema | Fundo escuro fixo + cartão branco | Requisito visual; sem toggle. |
| Fontes | System stack | Sem dependência externa, carregamento rápido. |
| Imagens | Nenhuma; apenas SVG inline | Performance e consistência. |
| Testes | QA manual obrigatório; unitários recomendados | Mantém o MVP enxuto sem abrir mão de qualidade. |

---

## 18. Referências

- Brain dump: `.docs/brain-dump.md`
- Open-Meteo Forecast API: <https://open-meteo.com/en/docs>
- Open-Meteo Geocoding API: <https://open-meteo.com/en/docs/geocoding-api>
- Open-Meteo License: <https://open-meteo.com/en/license>
- WMO Weather interpretation codes: documentação da Open-Meteo
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
