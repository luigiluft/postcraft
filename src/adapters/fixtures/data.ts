/**
 * Fixture dataset — a coherent demo brand ("Nimbus Logística", a BR
 * fullcommerce/3PL for D2C brands) so the whole pipeline runs end-to-end with
 * ZERO API keys and produces real rendered carousels.
 *
 * Fixture mode == demo mode. For real brands, set ANTHROPIC_API_KEY etc.
 */
import {
  type BrandIntelligence,
  type BrandInput,
  type CarouselSpec,
  type PostConcept,
  type VisualPlaybook,
} from "../../types.js";
import { slugify } from "../../util/ids.js";

export const NIMBUS_BRAND: BrandInput = {
  name: "Nimbus Logística",
  domain: "nimbuslog.com.br",
  instagram: "@nimbuslog",
  linkedin: "company/nimbuslog",
  competitors: ["@frete.rapido", "@total.express"],
  goals: ["gerar leads de marcas D2C", "educar sobre terceirizar operação"],
  locale: "pt-BR",
  notes: "Fullcommerce/3PL para marcas D2C que querem crescer sem montar CD.",
};

export const FIXTURE_SITE_FACTS = {
  summary:
    "A Nimbus opera o e-commerce de marcas D2C de ponta a ponta — estoque, picking, frete, SAC e logística reversa — com a marca 100% do cliente na frente.",
  products: [
    "Fullcommerce (operação completa)",
    "Fulfillment 3PL",
    "Logística reversa",
    "SAC e pós-venda",
  ],
  valueProps: [
    "Cresça sem montar centro de distribuição",
    "Frete mais barato por volume agregado",
    "SLA de prazo monitorado em tempo real",
  ],
};

export const FIXTURE_INTEL: BrandIntelligence = {
  positioning:
    "A operação de e-commerce que marcas D2C terceirizam para escalar sem imobilizar capital em CD próprio.",
  category: "Fullcommerce / 3PL para marcas D2C",
  differentiators: [
    "Marca do cliente 100% na frente (white-label)",
    "Frete agregado por volume",
    "Operação + SAC + reversa num contrato só",
  ],
  voice: {
    persona: "Operador que traduz logística complexa em decisão de negócio",
    tone: ["institucional", "acessível", "direto", "sem jargão"],
    doList: [
      "traduzir o custo logístico em impacto na margem",
      "falar em 1ª pessoa do plural (a gente opera)",
      "ancorar em número quando houver",
    ],
    dontList: [
      "jargão de operador sem traduzir (buy box, take rate)",
      "promessa vaga sem conta por trás",
      "reclamar de concorrente",
    ],
    examplePhrases: [
      "A conta do frete grátis sai do seu bolso — a gente só deixa ela menor.",
      "Você não precisa de um CD. Precisa da operação rodando.",
    ],
    forbidden: ["barato", "milagre", "o melhor do mercado"],
  },
  icps: [
    {
      id: "head-ecom-d2c",
      label: "Head de E-commerce / Founder D2C em escala",
      segment: "Marcas D2C R$ 5-50M/ano",
      role: "Head de E-commerce ou Founder",
      seniority: "decisor",
      jobsToBeDone: [
        "escalar pedidos sem quebrar a operação",
        "reduzir custo de envio sem perder prazo",
        "tirar logística do caminho do crescimento",
      ],
      pains: [
        "ruptura de estoque em pico",
        "frete grátis sangrando a margem",
        "SAC e reversa consumindo o time",
      ],
      desires: [
        "operação previsível",
        "margem saudável mesmo com frete grátis",
        "focar em marca e produto, não em galpão",
      ],
      triggers: [
        "estourou a capacidade do galpão próprio",
        "Black Friday chegando",
        "rodada de investimento exige eficiência",
      ],
      contentCravings: [
        "a conta real de terceirizar vs operar in-house",
        "benchmarks de custo logístico D2C",
        "casos de marcas que escalaram terceirizando",
        "como o frete grátis afeta a margem de verdade",
      ],
      objections: [
        "vou perder controle da experiência",
        "terceiro não cuida da minha marca como eu",
        "trocar de operação no meio do ano é arriscado",
      ],
      buyingStage: "problem-aware",
      verbatimTerms: [
        "frete grátis sangra a margem",
        "terceirizar logística vale a pena",
        "fullcommerce",
        "3PL no Brasil",
        "quando sair do CD próprio",
      ],
    },
  ],
  pillars: [
    {
      id: "a-conta",
      name: "A conta real",
      rationale:
        "O ICP decide por margem. Mostrar a matemática do frete/operação é o que prova autoridade.",
      icpCravings: [
        "a conta real de terceirizar vs operar in-house",
        "como o frete grátis afeta a margem de verdade",
      ],
      valueAxis: ["inform", "prove"],
      weight: 0.35,
    },
    {
      id: "operacao",
      name: "Como a operação roda por baixo",
      rationale: "Desmistifica a caixa-preta da logística — gera confiança.",
      icpCravings: ["benchmarks de custo logístico D2C"],
      valueAxis: ["inform", "entertain"],
      weight: 0.25,
    },
    {
      id: "casos",
      name: "Casos de marcas que escalaram",
      rationale: "Prova social específica do segmento move o problem-aware.",
      icpCravings: ["casos de marcas que escalaram terceirizando"],
      valueAxis: ["prove", "entertain"],
      weight: 0.25,
    },
    {
      id: "tendencias",
      name: "Tendências D2C BR",
      rationale: "Mantém a marca no radar entre decisões.",
      icpCravings: ["benchmarks de custo logístico D2C"],
      valueAxis: ["inform"],
      weight: 0.15,
    },
  ],
  proofAssets: [
    {
      claim: "Marcas reduzem o custo logístico ao migrar para volume agregado",
      value: "12-18%",
      class: "internal-anonymized",
      note: "média de 30+ operações acompanhadas",
    },
    {
      claim: "SLA de pedidos entregues no prazo",
      value: "99,2%",
      class: "internal-anonymized",
      note: "últimos 12 meses, base agregada",
    },
    {
      claim: "Tempo para subir a operação completa de uma marca nova",
      value: "21 dias",
      class: "internal-anonymized",
    },
  ],
  confidence: 0.6,
};

export const FIXTURE_PLAYBOOK: VisualPlaybook = {
  references: [
    {
      source: "Ramp (global)",
      handle: "@ramp",
      scope: "global",
      why: "Capa com tipografia gigante + 1 número; miolo limpo, um dado por slide.",
      anatomy: ["capa: número gigante", "miolo: 1 stat/slide", "cta: 1 ação"],
      takeaways: ["contraste de escala", "um conceito por slide"],
    },
    {
      source: "Stripe Press (global)",
      scope: "global",
      why: "Still-life editorial de objeto único como metáfora — nada de stock.",
      anatomy: [],
      takeaways: ["objeto-metáfora > foto genérica", "paleta disciplinada"],
    },
    {
      source: "Frete Rápido (local)",
      handle: "@frete.rapido",
      scope: "local-competitor",
      why: "Template repetido em loop, sem hierarquia — exatamente o que evitar.",
      anatomy: [],
      takeaways: ["não repetir a mesma capa 6x", "criar anatomia por slide"],
    },
  ],
  carouselAnatomy: [
    "slide 1 (capa): tipografia gigante + 1 objeto-metáfora, promete o payoff",
    "slides 2-5: uma ideia cada — espelho, contexto, stat, quote",
    "slide 6 (cta): uma única ação",
  ],
  hookPatterns: [
    "tensão de reconhecimento ('o frete grátis não é grátis')",
    "número contra-intuitivo na capa",
    "pergunta que o ICP já se fez",
  ],
  colorPatterns: ["fundo escuro + 1 acento quente", "muito respiro negativo"],
  typePatterns: ["serif display na capa", "sans para corpo e dados"],
  layoutGrammar: [
    "número dominante centralizado no slide de stat",
    "checklist alinhado à esquerda com marcador de acento",
  ],
  designTokens: {
    palette: {
      bg: "#101418",
      ink: "#F4F1EA",
      accent: "#E8643C",
      muted: "#8A8F98",
      surface: "#1A1F26",
    },
    fonts: { display: "Fraunces", body: "Inter" },
    radius: 0,
    mood: ["editorial", "operacional", "confiante"],
  },
  doList: [
    "uma ideia por slide",
    "objeto-metáfora na paleta da marca",
    "número grande quando houver prova",
  ],
  dontList: [
    "mesma capa repetida 6x",
    "foto de galpão genérica mood-only",
    "texto dentro da imagem gerada",
  ],
};

export const FIXTURE_CONCEPTS: PostConcept[] = [
  {
    id: "frete-gratis-nao-e-gratis",
    pillarId: "a-conta",
    icpId: "head-ecom-d2c",
    angle: "Desmonta a ilusão do frete grátis mostrando de onde sai a conta",
    hook: "O {frete grátis} não é grátis.|Ele sai da sua margem.",
    hypothesis:
      "O head de e-com sente essa dor todo mês — nomear a conta para o reconhecimento.",
    valueAxis: ["inform", "prove"],
    format: "carousel",
    durability: "evergreen",
    proofRef: 0,
  },
  {
    id: "quando-sair-do-cd-proprio",
    pillarId: "operacao",
    icpId: "head-ecom-d2c",
    angle: "Os 4 sinais de que o CD próprio virou gargalo",
    hook: "4 sinais de que seu {CD próprio}|já está te segurando",
    hypothesis: "Checklist de auto-diagnóstico tem alto save-rate no segmento.",
    valueAxis: ["inform"],
    format: "carousel",
    durability: "evergreen",
  },
  {
    id: "21-dias-operacao",
    pillarId: "casos",
    icpId: "head-ecom-d2c",
    angle: "Como uma marca subiu a operação completa em 21 dias",
    hook: "Do contrato ao 1º pedido:|{21 dias}",
    hypothesis: "Número concreto + caso prova viabilidade para o cético.",
    valueAxis: ["prove", "entertain"],
    format: "carousel",
    durability: "temporal",
    proofRef: 2,
  },
  {
    id: "controle-vs-terceirizar",
    pillarId: "a-conta",
    icpId: "head-ecom-d2c",
    angle: "Terceirizar não é perder controle — é trocar de painel",
    hook: "Terceirizar logística|≠ perder o {controle}",
    hypothesis: "Desarma a objeção #1 do ICP de forma direta.",
    valueAxis: ["inform", "entertain"],
    format: "carousel",
    durability: "evergreen",
  },
  {
    id: "sla-99-2",
    pillarId: "casos",
    icpId: "head-ecom-d2c",
    angle: "O que significa um SLA de 99,2% na prática para a marca",
    hook: "{99,2%} no prazo.|O resto é desculpa.",
    hypothesis: "Prova dura ancora a credibilidade operacional.",
    valueAxis: ["prove"],
    format: "carousel",
    durability: "evergreen",
    proofRef: 1,
  },
  {
    id: "black-friday-operacao",
    pillarId: "tendencias",
    icpId: "head-ecom-d2c",
    angle: "Preparar a operação para o pico sem contratar exército temporário",
    hook: "Black Friday não quebra marca.|{Operação despreparada} quebra.",
    hypothesis: "Gatilho sazonal cria urgência no problem-aware.",
    valueAxis: ["inform", "entertain"],
    format: "carousel",
    durability: "temporal",
  },
];

// ── Programmatic carousel builder (fixture) ──────────────────────────────
// Builds a valid, grammar-correct spec from the hook/angle parsed out of the
// prompt, so the demo renders a distinct carousel per concept.

function pick(prompt: string, label: string): string {
  const m = prompt.match(new RegExp(`- ${label}: (.+)`));
  return m?.[1]?.trim() ?? "";
}

function imageBrief(metaphor: string, tokens = FIXTURE_PLAYBOOK.designTokens) {
  return {
    role: "background" as const,
    prompt: `editorial still-life, single object as concept metaphor: ${metaphor}, studio lit, ${tokens.mood.join(", ")} mood, brand palette`,
    negativePrompt: "text, words, letters, logos, watermark, extra fingers",
    refImages: [],
    style: "Stripe Press / Monocle product styling",
    palette: [tokens.palette.bg, tokens.palette.accent, tokens.palette.ink],
    aspectRatio: "4:5",
  };
}

export function buildFixtureCarousel(prompt: string): CarouselSpec {
  const hook = pick(prompt, "hook \\(cover\\)") || "Sua operação|merece um upgrade";
  const angle = pick(prompt, "angle") || FIXTURE_INTEL.positioning;
  const tokens = FIXTURE_PLAYBOOK.designTokens;
  const proof = FIXTURE_INTEL.proofAssets[0]!;

  return {
    conceptId: slugify(hook),
    format: "carousel",
    title: hook.replace(/[{}|]/g, " ").replace(/\s+/g, " ").trim(),
    slides: [
      {
        n: 1,
        archetype: "cover",
        fields: { kicker: "NIMBUS · OPERAR", title: hook },
        image: imageBrief("a paper boat carrying a heavy gold coin"),
      },
      {
        n: 2,
        archetype: "mirror",
        fields: {
          punchline: "Todo mês você paga a conta|e chama de {cortesia}.",
          aside: "(o cliente nem percebe — você sim)",
        },
        image: imageBrief("an open wallet with a delivery box inside"),
      },
      {
        n: 3,
        archetype: "context",
        fields: {
          title: angle,
          body: "Volume agregado derruba o custo unitário.|A margem volta sem subir o preço.",
        },
        image: imageBrief("two scales balancing a box and a coin"),
      },
      {
        n: 4,
        archetype: "stat",
        fields: {
          label: "REDUÇÃO DE CUSTO LOGÍSTICO",
          number: proof.value ?? "12-18%",
          desc: "ao migrar para|volume agregado",
          sub: `${proof.note ?? "base agregada"} — {dado proprietário}`,
        },
        image: imageBrief("a downward arrow made of stacked shipping labels"),
      },
      {
        n: 5,
        archetype: "quote",
        fields: {
          lead: "A real é simples:",
          quote: "Você não precisa de um {CD}.|Precisa da operação rodando.",
        },
        image: imageBrief("a single warehouse shelf dissolving into light"),
      },
      {
        n: 6,
        archetype: "cta",
        fields: {
          question: "Quanto a {cortesia} custou no último trimestre?",
          ctaLabel: "Faça a conta com a gente",
          ctaMeta: "link na bio · diagnóstico gratuito",
        },
        image: imageBrief("a calculator and a delivery truck, top-down"),
      },
    ],
    caption: {
      instagram:
        "O frete grátis não é grátis — ele sai da sua margem.\n\nA gente não acaba com a conta. A gente deixa ela menor: volume agregado derruba o custo unitário e a margem volta sem você subir o preço.\n\nQuanto a “cortesia” custou no seu último trimestre? Faz a conta com a gente — link na bio.",
      linkedin:
        "Frete grátis é uma decisão de margem, não de marketing. Ao agregar volume, marcas D2C que operam com a Nimbus reduzem o custo logístico em 12-18%. A pergunta certa não é 'como dar frete grátis', é 'quanto ele está custando'.",
    },
    hashtags: ["#ecommerce", "#logística", "#D2C", "#fullcommerce", "#3PL"],
    cta: {
      label: "Faça a conta com a gente",
      meta: "link na bio · diagnóstico gratuito",
    },
    designTokens: tokens,
    valueAxis: ["inform", "prove"],
  };
}
