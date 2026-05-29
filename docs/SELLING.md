# Como vamos vender a Postcraft — playbook decidido

> Decisão tomada. Não são opções: é o caminho 0→1. Refina com dados depois das 5 primeiras vendas.

## A decisão: serviço produtizado primeiro, SaaS depois

Vender SaaS self-serve agora exige multi-tenant, billing, onboarding — semanas de infra antes do primeiro real. **O motor já funciona e a tua curadoria é o diferencial.** Então:

**Fase 1 (agora — monetiza esta semana): serviço produtizado.** Você roda o motor, aplica os 3 gates de qualidade e entrega kits prontos. Preço de agência, cobrança Pix. Zero infra nova.

**Fase 2 (depois de ~10 clientes pagantes): SaaS self-serve.** Aí a demanda já está provada e o roadmap (`docs/ROADMAP.md` v0.3→v0.4) constrói o painel. Não inverta a ordem.

## Quem compra (wedge)

1. **Agências B2B / social** — maior disposição a pagar, rodam várias marcas, sentem a dor de "carrossel genérico" na pele. **Alvo primário.** Vende white-label.
2. **Indústrias/distribuidores B2B BR** (ecossistema Agrega/Luft) — já no teu network, ICP nítido, frete/margem/operação como pauta.
3. **Founders D2C/SaaS em escala** — querem presença sem montar time de conteúdo.

Comece pelo (1) e (2): é onde você tem rede e prova.

## A oferta

> "A Postcraft lê tudo que a sua empresa é — site, notícias, redes, marca — descobre o que o seu comprador quer ler, estuda concorrentes, e entrega carrosséis prontos pra postar. Sem template genérico."

| Plano | Preço (BRL) | Entrega |
|---|---|---|
| **Diagnóstico** (porta de entrada) | R$ 990 único | Inteligência + ICP editável + playbook visual + 2 carrosséis. Abatido no 1º mês. |
| **Starter** | R$ 1.490/mês | 1 marca · 8 posts/mês (~R$186/post) · 1 rodada |
| **Studio** (mais vendido) | R$ 2.990/mês | 1 marca · 20 posts/mês (~R$150/post) · pesquisa contínua · calendário · 2 rodadas |
| **Agência / White-label** | a partir de R$ 6.000/mês | múltiplas marcas · white-label · aprovação |

Margem: custo de API por kit é de centavos a poucos reais (ver `docs/OPERATING.md`). A margem é altíssima — o gargalo é o teu tempo de curadoria, que o motor reduz a minutos.

## O motor de vendas (passo a passo)

O fechamento é o **carrossel de teste grátis** — ele prova a qualidade antes de qualquer pitch.

1. **Prospecção.** Liste 20 alvos/semana: marcas do ecossistema Agrega, agências B2B, indústrias que postam mal no IG/LinkedIn. Sinais de compra: postam pouco/genérico, têm site bom mas feed fraco, lançaram algo recente.
2. **Abordagem (DM/e-mail).** Oferta única: "manda o domínio, devolvo 1 carrossel na tua marca em 48h, sem custo". Script abaixo.
3. **Rodar o motor.** Pegou o domínio → rode o pipeline (`docs/OPERATING.md`). Em modo live (keys) ou, se faltar key, harvest manual + motor. Saída em <48h.
4. **Entregar o teaser.** Mande os 6 slides + a tese do ICP por trás ("é isso que o teu comprador quer ler porque..."). O teaser JÁ demonstra a inteligência, não só a arte.
5. **Call de 20 min.** Apresente o ICP editável + o playbook visual (concorrentes). Mostre o gap: "olha como teu concorrente posta vs o que dá pra fazer". Aqui você vira consultor, não fornecedor.
6. **Fechar.** Ofereça o **Diagnóstico (R$990)** como passo de baixo atrito OU já o **Studio** se o fit for claro. Diagnóstico converte em mensal em ~1-2 semanas.
7. **Onboard.** Intake (ver OPERATING) → primeira leva em 1 semana → ritmo mensal.

## Scripts (PT-BR, prontos)

**DM/LinkedIn (frio):**
> Oi [nome], acompanho a [empresa]. Construí um motor que lê o site + redes + concorrentes de uma empresa e gera carrossel B2B no estilo da marca — focado no que o comprador de vocês quer ler. Topa eu te mandar **1 carrossel de teste da [empresa] em 48h, sem custo**? Você decide se faz sentido depois de ver.

**E-mail (pós-reunião/morno):**
> Assunto: 1 carrossel da [empresa] — sem custo
> [nome], como combinei: me manda o domínio e os perfis (IG/LinkedIn) e 2-3 concorrentes. Devolvo em 48h um carrossel pronto pra postar + o ICP que usei como base. Se gostar, a gente fala de ritmo mensal; se não, você fica com a peça.

**Follow-up pós-teaser:**
> Esse carrossel saiu do que a [empresa] já comunica + o que vi nos concorrentes. No plano Studio isso vira 20 posts/mês com pesquisa contínua. Quer começar com o Diagnóstico (R$990, abatido no 1º mês) pra eu mapear o ICP completo e o playbook visual?

## Objeções → respostas

- **"IA não inventa dado da minha empresa?"** → Todo número é classificado pela origem; sem prova real, não entra sob a voz da marca. (É um diferencial — mostre.)
- **"Já uso Canva/ferramenta X."** → Aquilo executa template. Aqui a diferença é o ICP e a pesquisa de concorrente virando direção de arte. Veja o teaser.
- **"Tá caro."** → Compare com 1 social media júnior (R$3-5k/mês) que entrega menos e mais lento, ou um freelancer a R$200-400/carrossel. O Studio sai ~R$150/post com estratégia junto. Ou comece no Diagnóstico (R$990).
- **"Posto eu mesmo?"** → Sim, entrego pronto. Agendamento entra no Studio.

## Canais & cadência

- **Outbound founder-led** (DM/e-mail) — principal no 0→1.
- **LinkedIn orgânico** — poste os próprios carrosséis da Postcraft (dogfooding = prova viva).
- **Landing** (`landing/index.html`) — asset de conversão; CTA = e-mail do teaser.
- **Network Agrega/Luft** — primeiros casos.

## Métricas (semanais)

`alvos contatados → teasers entregues → calls → diagnósticos → mensais`. Meta inicial: 20 → 5 → 3 → 2 → 1. Acompanhe taxa teaser→call (qualidade da peça) e call→fechamento (qualidade do pitch).

## Não fazer

- Não construir SaaS antes de 10 pagantes.
- Não prometer publicação/agendamento no Starter.
- Não citar cliente identificável sem ok.
- Não mandar número sem prova (mata a confiança e o diferencial).
