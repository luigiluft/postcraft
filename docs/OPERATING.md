# Como operar a entrega — passo a passo

> Da chegada do cliente ao kit pronto. Use junto com `docs/SELLING.md` (venda) e `docs/PIPELINE.md` (o que cada etapa faz).

## 0. Setup (uma vez)

```bash
cd postcraft
npm install
cp .env.example .env     # adicione as keys (veja abaixo)
npm run demo             # confirma que renderiza (modo fixture, sem key)
npm test                 # 5 testes verdes
```

**Keys para modo produção** (cada uma promove uma etapa de fixture → live; sem ela, cai no fixture):

| Key | Habilita | Onde |
|---|---|---|
| `ANTHROPIC_API_KEY` | Understand · Research · Generate | console.anthropic.com |
| `FIRECRAWL_API_KEY` | Harvest (site, notícias, brand kit) | firecrawl.dev (Hobby ~US$16) |
| `APIFY_TOKEN` | Harvest (redes sociais) | apify.com (Starter ~US$29) |
| `FAL_KEY` ou `IDEOGRAM_API_KEY` | Render (fundos por IA) | fal.ai / ideogram.ai |

> ⚠️ Os adapters live seguem a v1 das APIs — **valide os endpoints contra a doc atual de cada provider antes de cobrar** (está marcado nos arquivos `src/adapters/*`). O modo fixture já entrega valor pra demo/teaser sem key.

## 1. Intake do cliente (colete antes de rodar)

- [ ] Nome + domínio do site
- [ ] Perfis: Instagram, LinkedIn (e TikTok se houver)
- [ ] 2-3 concorrentes (handles ou domínios)
- [ ] Objetivo do conteúdo (ex.: gerar leads, educar mercado)
- [ ] Restrições de marca (o que NÃO falar, clientes que não podem ser citados)
- [ ] Logo (de preferência o **símbolo quadrado**, PNG/SVG) — opcional: o motor extrai do site automaticamente, mas um logo limpo fica melhor no slide

Salve num brief JSON:

```json
{
  "name": "Empresa X",
  "domain": "empresax.com.br",
  "instagram": "@empresax",
  "linkedin": "company/empresax",
  "competitors": ["@concorrente1", "@concorrente2"],
  "goals": ["gerar leads B2B"],
  "locale": "pt-BR",
  "notes": "não citar clientes nominais"
}
```

## 2. Rodar o motor

```bash
# a partir do brief
npm run cli -- run --brief brief.json --concepts 8 --kits 3

# ou direto por flags
npm run cli -- run --name "Empresa X" --domain empresax.com.br \
  --instagram @empresax --competitors "@c1,@c2" --concepts 8 --kits 3

# logo: extraído do site automaticamente; para forçar um logo limpo, use --logo
npm run cli -- run --brief brief.json --logo ./logo-cliente.png
```

Saída em `runs/<empresa>_<timestamp>/`:
```
run.json                  # inteligência + playbook + conceitos + kits
<conceito>/
  spec.json               # roteiro do carrossel
  caption.txt             # legendas IG + LinkedIn + hashtags
  assets/bg-1..6.png      # fundos (IA)
  slide-1..6.png          # slides finais 1080×1350
```

## 3. Os 3 gates de qualidade (faça SEMPRE)

O motor é rápido; o teu olho é o produto. Não pule.

- **Gate 1 — Inteligência (`run.json`).** O ICP está certo? Os `proofAssets` têm origem honesta (sem número fabricado)? Os pilares fazem sentido? Corrija o brief/notes e rode de novo se preciso.
- **Gate 2 — Conceitos.** Os hooks param o scroll? Variam pilar/ICP? Escolha os melhores para virar kit (`--kits` controla quantos).
- **Gate 3 — Slides renderizados.** Abra os `slide-*.png`: capa para o scroll? texto legível, sem vazar `{ }` ou `|`? imagem casa com o copy? Ajuste a `spec.json` e re-renderize se preciso.

Checklist de barra de qualidade (do `agrega-content-engine`, generalizado):
- [ ] Capa entrega para-scroll (não é só informativa morna)
- [ ] Miolo informa (uma ideia por slide)
- [ ] Toda prova ancora num `proofAsset` real
- [ ] Nenhuma marca/cliente citado sem ok
- [ ] Legenda não cita número que o carrossel/post não tem

## 4. Entrega

- Mande os PNGs + `caption.txt`. Formato pronto pra postar.
- No teaser (venda): mande os 6 slides + 2 frases do ICP por trás ("foquei nisso porque o teu comprador...").
- No mensal: entregue a leva + um mini-calendário (qual post em qual dia).

## 5. Ritmo mensal (cliente recorrente)

1. Atualize o brief se houver novidade (lançamento, notícia).
2. Rode o motor (o `run.json` anterior serve de baseline — evite repetir hooks/temas).
3. Gates 1-3 → entrega → agenda.
4. 1x/mês: re-rode a pesquisa de concorrentes (playbook) pra captar mudança visual do mercado.

## Custo por kit (margem)

- LLM (Understand+Research+Generate): centavos a ~R$1 por marca/rodada (com prompt caching).
- Firecrawl: ~1 crédito/página (evitamos o `/extract` caro).
- Apify: ~US$0,50–2 por perfil completo.
- Imagem (fal/Ideogram): ~R$0,05–0,20 por fundo × 6 slides.
- Render (Satori): grátis (sem browser).

**Total por marca/rodada: poucos reais.** A margem sobre R$1.900–3.900/mês é o produto. O tempo de curadoria (gates) é o custo real — minimize com os defaults e só intervenha onde o olho pega.

## Solução de problemas

- **Slide com fundo só gradiente** → a imagem daquele slide falhou (key ausente/erro do provider). Aceitável como rascunho; re-rode com key válida para a versão final.
- **`completeJSON failed schema`** → o LLM live devolveu JSON inválido 2x; verifique a key/modelo (`ANTHROPIC_MODEL`) e rode de novo.
- **Texto cortado/estranho no slide** → encurte o copy na `spec.json` e re-renderize (`spec.json` é re-renderizável isolado).
