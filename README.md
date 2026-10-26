# Clima

[![Deploy to GitHub Pages](https://github.com/fernandosreis122-ux/clima/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/fernandosreis122-ux/clima/actions/workflows/deploy-pages.yml)

Aplicação web para consultar as condições atuais de temperatura, sensação térmica, umidade, chuva e vento de qualquer cidade.

**Site:** [fernandosreis122-ux.github.io/clima](https://fernandosreis122-ux.github.io/clima/)

## Visão geral

O Clima é uma aplicação **100% client-side**, feita com Vite e TypeScript, sem backend, banco de dados ou persistência. As consultas são enviadas diretamente para a API pública da [Open-Meteo](https://open-meteo.com/).

A interface foi construída em português do Brasil e inclui estados de carregamento, validação, sucesso e erros específicos para cada etapa da consulta.

## Funcionalidades

- Busca de cidade por nome.
- Temperatura atual e condição do tempo.
- Sensação térmica.
- Umidade relativa do ar.
- Probabilidade de precipitação.
- Velocidade e direção do vento.
- Data e horário da observação.
- Ícone de dia ou noite conforme os dados atuais.
- Estados de carregamento com skeleton.
- Tratamento de cidade não encontrada, dados indisponíveis e falha de rede.
- Opção de tentar novamente em erros temporários.
- Layout responsivo a partir de 320 px.
- Navegação por teclado, foco visível e regiões de status para tecnologias assistivas.
- Suporte a `prefers-reduced-motion`.

## Stack

- [Vite 8](https://vite.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- CSS puro, sem framework
- [Vitest 5](https://vitest.dev/) e jsdom
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)

Não há dependências de runtime. TypeScript, Vite, Vitest e jsdom são dependências de desenvolvimento.

## Como executar

### Pré-requisitos

- Node.js 24 ou superior
- npm 11 ou superior

### Instalação

```bash
git clone https://github.com/fernandosreis122-ux/clima.git
cd clima
npm ci
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação fica disponível em:

```text
http://localhost:5173/clima/
```

> O caminho `/clima/` é intencional: ele corresponde à base configurada para o GitHub Pages em `vite.config.ts`.

### Build de produção

```bash
npm run build
npm run preview
```

O preview fica disponível em `http://localhost:4173/clima/`.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR. |
| `npm run build` | Executa a checagem do TypeScript e gera o build em `dist/`. |
| `npm run preview` | Serve o build de produção localmente. |
| `npm test` | Executa a suíte de testes uma vez. |
| `npm run test:watch` | Executa os testes em modo watch. |

## Estrutura do projeto

```text
.
├── .docs/                      # PRD, tasks e relatórios de QA
├── .github/workflows/
│   └── deploy-pages.yml        # CI/CD para o GitHub Pages
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── controller.ts       # Fluxo de busca, concorrência e timeout
│   │   ├── query.ts            # Normalização da consulta
│   │   └── state.ts            # Estados da aplicação
│   ├── domain/
│   │   ├── format.ts           # Formatação de datas, números e vento
│   │   ├── types.ts            # Tipos do domínio
│   │   └── weather-codes.ts    # Descrições dos códigos WMO
│   ├── services/
│   │   ├── open-meteo.ts       # Única camada que usa fetch
│   │   └── weather-lookup.ts   # Orquestra geocodificação + previsão
│   ├── ui/
│   │   ├── dom.ts
│   │   ├── icons.ts
│   │   ├── render.ts           # Estados visuais
│   │   └── shell.ts            # Estrutura persistente da página
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

Os testes ficam ao lado dos arquivos testados, com o sufixo `.test.ts`.

## Como funciona

1. O usuário informa o nome de uma cidade.
2. A consulta é normalizada e validada no cliente.
3. A camada de serviços consulta a API de geocodificação da Open-Meteo e usa apenas o primeiro resultado retornado.
4. Com latitude, longitude e timezone da cidade, a API de previsão retorna as condições atuais.
5. Os dados são validados, formatados em pt-BR e renderizados na interface.
6. Em caso de erro, o estado visual correspondente é exibido.

As unidades são lidas de `current_units`, com fallback para `°C`, `%` e `km/h`. Os horários são interpretados e formatados a partir de `current.time` sem conversão de fuso, preservando o horário local retornado pela API.

## Estados e erros

| Estado | Quando ocorre | Possui retry |
| --- | --- | --- |
| Vazio | Nenhuma busca foi feita ainda. | Não |
| Loading | Consulta em andamento. | Não |
| Sucesso | Cidade e clima retornados com sucesso. | Não |
| Cidade não encontrada | A geocodificação não retornou uma cidade válida. | Não |
| Clima indisponível | A cidade foi encontrada, mas os dados atuais são inválidos ou ausentes. | Sim |
| Erro de rede | Falha de conexão, resposta HTTP inválida ou timeout. | Sim |
| Consulta vazia | O formulário foi enviado sem uma cidade. | Não |

O timeout total de cada busca é de **12 segundos**. Uma nova busca cancela a anterior, e respostas atrasadas são descartadas para evitar que dados antigos substituam o resultado mais recente.

## API e privacidade

- **Geocodificação:** `https://geocoding-api.open-meteo.com/v1/search`
- **Previsão:** `https://api.open-meteo.com/v1/forecast`
- A Open-Meteo não exige chave de API para este uso.
- Nenhum dado é enviado para servidores próprios.
- Não há cookies, `localStorage`, `sessionStorage`, analytics ou rastreamento.
- A aplicação não usa geolocalização, autocomplete nem polling.
- Apenas o primeiro resultado da geocodificação é utilizado.

## Acessibilidade e responsividade

- Estrutura semântica com landmarks, formulário e títulos.
- Labels explícitos e mensagens de erro associadas ao campo de busca.
- Regiões `aria-live` para anunciar carregamento, sucesso e erros.
- Foco visível e gerenciamento de foco após validação e falhas.
- Contraste compatível com WCAG AA nos estados principais.
- Layout testado em larguras a partir de 320 px, sem scroll horizontal.
- Movimento reduzido respeitado via `prefers-reduced-motion`.

## Testes

```bash
npm test
```

A suíte cobre normalização de consulta, estados do controller, timeout e concorrência, parsing da API, formatação, códigos WMO, renderização, shell e ícones.

Validação atual: **302 testes em 9 arquivos**.

## Deploy

O deploy é feito automaticamente pelo GitHub Actions no arquivo `.github/workflows/deploy-pages.yml`.

O workflow é disparado por:

- `push` na branch `main`;
- execução manual em **Actions → Deploy to GitHub Pages → Run workflow**.

Etapas executadas:

1. Checkout do repositório.
2. Configuração do Node.js 24.
3. `npm ci`.
4. `npm test`.
5. `npm run build`.
6. Upload do diretório `dist` como artefato do GitHub Pages.
7. Deploy do artefato.

O GitHub Pages deve estar configurado em **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Site publicado: [https://fernandosreis122-ux.github.io/clima/](https://fernandosreis122-ux.github.io/clima/)

Se o repositório for renomeado ou publicado em outro caminho, atualize `base` em `vite.config.ts` para o novo caminho.

## Documentação

- [PRD](.docs/prd.md)
- [Tasks](.docs/tasks.md)
- [QA final](.docs/qa/t19-final.md)
- [Evidências de responsividade](.docs/qa/t17-responsive.md)
- [Evidências de acessibilidade](.docs/qa/t18-accessibility.md)

## Limitações

- A disponibilidade depende da Open-Meteo.
- A busca usa apenas o primeiro resultado da geocodificação; cidades homônimas podem exigir um nome mais específico.
- Não há histórico, previsão estendida, favoritos ou comparação entre cidades.
- Não há backend, cache de aplicação ou modo offline.
