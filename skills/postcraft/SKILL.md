---
name: postcraft
description: Use quando o usuário quer gerar carrosséis/posts visuais a partir de UMA empresa (domínio, @perfil) — extrai site/notícias/redes/marca, descobre o ICP, estuda concorrentes e entrega carrosséis prontos pra postar (texto nítido + logo). Gatilhos — "postcraft <empresa>", "cria um carrossel da <empresa>", "gera conteúdo pra <domínio>", "carrossel ICP da <marca>".
---

# Postcraft — motor de empresa → carrossel (dentro do Claude Code)

Orquestra o pipeline da Postcraft usando as ferramentas MCP do usuário (Firecrawl, Apify, Higgsfield) + o **renderer determinístico** do repositório. A IA faz o fundo; o texto e o logo são desenhados por cima (sempre legíveis).

## Pré-requisitos (uma vez)
- Repo clonado e `npm install` feito. Defina o caminho: `POSTCRAFT_DIR` (ex.: `~/postcraft`). Se não setado, pergunte ao usuário onde clonou.
- **Sem API key:** você (Claude) faz a inteligência/pesquisa/geração na própria conversa — **não precisa de `ANTHROPIC_API_KEY`**. As keys de Firecrawl/Apify/Higgsfield ficam na config das MCPs do Claude Code, não no `.env`.
- MCP úteis (degrada com elegância se faltar): **Firecrawl** (site/notícias/marca), **Apify** (redes), **Higgsfield** ou **fal** (fundos). Sem nenhum, dá pra rodar com `npm run demo` (dados de exemplo).

## Entrada
Empresa via linguagem natural. Se faltar, **descubra** (WebSearch): domínio, Instagram, 2 concorrentes. Confirme com o usuário antes de gastar créditos.

## Fluxo (5 etapas + 1 gate humano)

### ① COLETA
- Site: `firecrawl` scrape/crawl do domínio (renderiza JS p/ SPA) → texto real (o que faz, produtos, value props, voz).
- Notícias: `firecrawl-search`/WebSearch "<marca>".
- Redes: `apify` (Instagram/LinkedIn) — temas e engajamento (opcional).
- **Logo + marca:** pegue o logo (Firecrawl `branding` → `logo`; senão `og:image`/favicon hi-res `https://www.google.com/s2/favicons?domain=<host>&sz=256`) e a paleta/cores. Baixe o logo (de preferência **símbolo quadrado**); se SVG, rasterize.

### ② ENTENDE  (você, como o LLM)
Produza, ancorado SÓ no que coletou: posicionamento, voz, **ICP** (dores, desejos, gatilhos, objeções, `contentCravings`, `verbatimTerms`), pilares e **proofAssets** — cada número classificado `public-verifiable | internal-anonymized | fictional`. **Nunca invente número.**

### ③ PESQUISA
Estude 2-3 concorrentes (sites/Instagram) → playbook visual: anatomia, paleta (hex reais da marca), tipografia, do/don't. Identifique o território vago que a marca pode ocupar.

### ④ GERA
Escolha a receita (ex.: `thesis` = capa·espelho·contexto·stat·quote·cta) e escreva um **`carousel-spec.json`** no contrato do repo (ver `examples/demo.spec.json`). Regras:
- Capa para-scroll; miolo informa; `prova` só com `proofAsset` real.
- Marcadores: `{palavra}` = destaque, `|` = quebra de linha.
- 1 `image.prompt` por slide: objeto/cena que casa com o copy, **claro/luminoso, autêntico ao contexto** (ex.: agro BR = soja Cerrado, etnia local, máquinas reais, fauna regional), na paleta da marca, **SEM TEXTO**; `negativePrompt` banindo texto/logo/watermark.
- Caption IG + LinkedIn na voz da marca; todo número da caption tem âncora no spec.

### ⑤ RENDERIZA
1. **Fundos:** pra cada slide, `higgsfield generate_image` (`nano_banana_pro`, 4:5, "ABSOLUTELY NO TEXT") → poll `job_status sync:true` → baixe pra `runs/<marca>/assets/bg-N.png`. (Sem Higgsfield/fal → o fixture gera gradiente.)
2. **Render:** `cd $POSTCRAFT_DIR && tsx examples/render-spec.ts <spec.json> "<Marca>" runs/<marca> <logo.png>` — compõe texto + logo nítidos sobre os fundos → `slide-1..6.png` 1080×1350.
3. Gere uma folha de contato HTML e abra pro usuário (ver `runs/demo/view.html` como molde).

### GATE humano
Mostre os 6 slides + as legendas. Ajuste de copy = editar o spec e re-renderizar (segundos, sem gastar crédito — o render-spec **reusa** fundos existentes).

## Anti-padrões (parar)
- Número sem prova real sob a voz da marca.
- Texto dentro da imagem gerada (vira gibberish) — texto é sempre CSS/determinístico.
- Mesma capa/composição em 6 slides (cada slide tem anatomia própria).
- Foto genérica/estrangeira quando o contexto pede realidade local.
- Citar cliente identificável sem ok.

## Referência
- Contrato do spec + tipos: `src/types.ts` · gramática de slides: `src/carousel/grammar.ts`
- Exemplo real completo: `examples/demo.spec.json` (+ `runs/demo/`)
- Render isolado: `examples/render-spec.ts <spec> "<Marca>" <out> [logo]`
- Pipeline automatizado (com keys no `.env`): `npm run cli -- run --domain <d> --instagram @x --competitors "@a,@b"`
