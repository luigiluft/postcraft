# Contribuindo com a Postcraft

Feito pra amigos — manda PR, abre issue, usa em cima da tua realidade. 🌱

## Rodar localmente

```bash
git clone https://github.com/luigiluft/postcraft
cd postcraft
npm install
npm run demo        # zero keys → gera carrosséis de exemplo em runs/
npm test            # testes
npm run typecheck   # tipos
```

## Como o projeto é organizado

- `src/` — o motor. Comece por `src/types.ts` (contrato Zod), `src/carousel/grammar.ts` (arquétipos de slide) e `src/pipeline/` (as 5 etapas).
- `src/adapters/` — tudo que é externo (scraper, social, LLM, imagem, renderer) atrás de uma interface, com versão `fixture` (zero key) e `live`. **Quer plugar um provider novo?** Implemente a interface e registre em `src/config.ts`.
- `skills/postcraft/` — a skill do Claude Code (orquestra MCP + o renderer).
- `examples/` — `render-spec.ts` (renderiza um spec) e specs reais.
- `docs/` — arquitetura, pipeline, roadmap.

## Ideias de contribuição

- Novos arquétipos de slide / receitas narrativas (`src/carousel/grammar.ts`).
- Novos adapters (outro modelo de imagem, outro scraper, outro idioma).
- Skins de render (temas visuais).
- Validar/afinar os adapters live contra a doc atual de cada provider.

## Padrões

- TypeScript estrito, sem `any` onde der; valide entradas com Zod.
- Rode `npm run typecheck` e `npm test` antes do PR.
- Sem segredos no código — keys só via `.env` (veja `.env.example`).

Dúvida ou ideia? Abre uma issue. 🚀
