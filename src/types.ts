/**
 * Postcraft domain model — the contract every pipeline stage speaks.
 *
 * Zod is the single source of truth: schemas validate adapter output and
 * LLM-produced structures at the boundaries, and TS types are inferred from
 * them (`z.infer`). This keeps runtime validation and compile-time types DRY.
 *
 * Pipeline:  HARVEST → UNDERSTAND → RESEARCH → GENERATE → RENDER
 */
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────

export const LocaleSchema = z.enum(["pt-BR", "en-US", "es-ES"]);
export type Locale = z.infer<typeof LocaleSchema>;

/** The three things any piece of content must do (≥1, ideally all 3). */
export const ValueAxisSchema = z.enum(["inform", "entertain", "prove"]);
export type ValueAxis = z.infer<typeof ValueAxisSchema>;

export const DurabilitySchema = z.enum(["temporal", "evergreen"]);
export type Durability = z.infer<typeof DurabilitySchema>;

// ─────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────

export const BrandInputSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  tiktok: z.string().optional(),
  /** Competitor handles or domains the operator already knows. */
  competitors: z.array(z.string()).default([]),
  /** Business goals for this content run (e.g. "drive demo signups"). */
  goals: z.array(z.string()).default([]),
  locale: LocaleSchema.default("pt-BR"),
  notes: z.string().optional(),
});
export type BrandInput = z.infer<typeof BrandInputSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Stage 1 — HARVEST  (adapter output: scraper + social + brand kit)
// ─────────────────────────────────────────────────────────────────────────

export const ScrapedPageSchema = z.object({
  url: z.string(),
  title: z.string().default(""),
  markdown: z.string().default(""),
  kind: z
    .enum(["home", "about", "product", "blog", "pricing", "other"])
    .default("other"),
});
export type ScrapedPage = z.infer<typeof ScrapedPageSchema>;

export const NewsItemSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  source: z.string().optional(),
  date: z.string().optional(),
  snippet: z.string().default(""),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const SocialPostSchema = z.object({
  platform: z.string(),
  url: z.string().optional(),
  caption: z.string().default(""),
  likes: z.number().optional(),
  comments: z.number().optional(),
  postedAt: z.string().optional(),
  mediaType: z.enum(["image", "carousel", "video", "text"]).default("image"),
  themes: z.array(z.string()).default([]),
});
export type SocialPost = z.infer<typeof SocialPostSchema>;

export const SocialProfileSchema = z.object({
  platform: z.string(),
  handle: z.string(),
  followers: z.number().optional(),
  bio: z.string().default(""),
  posts: z.array(SocialPostSchema).default([]),
  topThemes: z.array(z.string()).default([]),
  avgEngagement: z.number().optional(),
});
export type SocialProfile = z.infer<typeof SocialProfileSchema>;

export const BrandKitSchema = z.object({
  /** Hex colors, ordered by prominence. */
  colors: z.array(z.string()).default([]),
  /** Font family names detected on site. */
  fonts: z.array(z.string()).default([]),
  logoUrl: z.string().optional(),
  /** URLs or short descriptions of representative imagery. */
  imagery: z.array(z.string()).default([]),
  visualLanguage: z.string().default(""),
});
export type BrandKit = z.infer<typeof BrandKitSchema>;

export const CompanyFootprintSchema = z.object({
  brand: BrandInputSchema,
  site: z.object({
    pages: z.array(ScrapedPageSchema).default([]),
    summary: z.string().default(""),
    products: z.array(z.string()).default([]),
    valueProps: z.array(z.string()).default([]),
  }),
  news: z.array(NewsItemSchema).default([]),
  social: z.array(SocialProfileSchema).default([]),
  brandKit: BrandKitSchema,
  collectedAt: z.string(),
});
export type CompanyFootprint = z.infer<typeof CompanyFootprintSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Stage 2 — UNDERSTAND  (LLM output: who they are, who buys, what to say)
// ─────────────────────────────────────────────────────────────────────────

export const ICPSchema = z.object({
  id: z.string(),
  label: z.string(),
  segment: z.string(),
  role: z.string().default(""),
  seniority: z.string().optional(),
  jobsToBeDone: z.array(z.string()).default([]),
  pains: z.array(z.string()).default([]),
  desires: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  /** What this person actually wants to SEE/READ in a feed. */
  contentCravings: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  buyingStage: z
    .enum(["unaware", "problem-aware", "solution-aware", "vendor-aware"])
    .default("problem-aware"),
  /** Exact phrases this person types/searches — verbatim, for hooks & SEO. */
  verbatimTerms: z.array(z.string()).default([]),
});
export type ICP = z.infer<typeof ICPSchema>;

export const VoiceProfileSchema = z.object({
  persona: z.string(),
  tone: z.array(z.string()).default([]),
  doList: z.array(z.string()).default([]),
  dontList: z.array(z.string()).default([]),
  examplePhrases: z.array(z.string()).default([]),
  forbidden: z.array(z.string()).default([]),
});
export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;

export const ProofAssetSchema = z.object({
  claim: z.string(),
  value: z.string().optional(),
  /** Provenance class — gates whether it can be used as hard proof. */
  class: z.enum(["public-verifiable", "internal-anonymized", "fictional"]),
  sourceUrl: z.string().optional(),
  sourceDate: z.string().optional(),
  note: z.string().optional(),
});
export type ProofAsset = z.infer<typeof ProofAssetSchema>;

export const ContentPillarSchema = z.object({
  id: z.string(),
  name: z.string(),
  rationale: z.string().default(""),
  /** Which ICP cravings this pillar feeds. */
  icpCravings: z.array(z.string()).default([]),
  valueAxis: z.array(ValueAxisSchema).default([]),
  /** Relative share of the calendar, 0..1. */
  weight: z.number().min(0).max(1).default(0.2),
});
export type ContentPillar = z.infer<typeof ContentPillarSchema>;

export const BrandIntelligenceSchema = z.object({
  positioning: z.string(),
  category: z.string().default(""),
  differentiators: z.array(z.string()).default([]),
  voice: VoiceProfileSchema,
  icps: z.array(ICPSchema).min(1),
  pillars: z.array(ContentPillarSchema).min(1),
  proofAssets: z.array(ProofAssetSchema).default([]),
  /** 0..1 — how grounded this is in real harvested data vs inference. */
  confidence: z.number().min(0).max(1).default(0.5),
});
export type BrandIntelligence = z.infer<typeof BrandIntelligenceSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Stage 3 — RESEARCH  (visual references: global best-in-class + local rivals)
// ─────────────────────────────────────────────────────────────────────────

export const VisualReferenceSchema = z.object({
  source: z.string(),
  handle: z.string().optional(),
  url: z.string().optional(),
  scope: z.enum(["global", "local-competitor"]),
  /** Why this is worth learning from. */
  why: z.string().default(""),
  engagementProxy: z.string().optional(),
  /** Slide-by-slide / layout breakdown if it's a carousel. */
  anatomy: z.array(z.string()).default([]),
  takeaways: z.array(z.string()).default([]),
});
export type VisualReference = z.infer<typeof VisualReferenceSchema>;

export const DesignTokensSchema = z.object({
  palette: z.object({
    bg: z.string().default("#0E0E0E"),
    ink: z.string().default("#F5F5F0"),
    accent: z.string().default("#E45A3B"),
    muted: z.string().default("#9A9A92"),
    surface: z.string().optional(),
  }),
  fonts: z.object({
    display: z.string().default("Fraunces"),
    body: z.string().default("Inter"),
  }),
  radius: z.number().default(0),
  mood: z.array(z.string()).default([]),
});
export type DesignTokens = z.infer<typeof DesignTokensSchema>;

export const VisualPlaybookSchema = z.object({
  references: z.array(VisualReferenceSchema).default([]),
  carouselAnatomy: z.array(z.string()).default([]),
  hookPatterns: z.array(z.string()).default([]),
  colorPatterns: z.array(z.string()).default([]),
  typePatterns: z.array(z.string()).default([]),
  layoutGrammar: z.array(z.string()).default([]),
  designTokens: DesignTokensSchema,
  doList: z.array(z.string()).default([]),
  dontList: z.array(z.string()).default([]),
});
export type VisualPlaybook = z.infer<typeof VisualPlaybookSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Stage 4 — GENERATE  (post concepts → carousel specs → image briefs)
// ─────────────────────────────────────────────────────────────────────────

export const PostFormatSchema = z.enum([
  "carousel",
  "single-image",
  "reel-cover",
  "story",
]);
export type PostFormat = z.infer<typeof PostFormatSchema>;

export const PostConceptSchema = z.object({
  id: z.string(),
  pillarId: z.string(),
  icpId: z.string(),
  angle: z.string(),
  hook: z.string(),
  /** Why this stops the scroll for THIS ICP. */
  hypothesis: z.string(),
  valueAxis: z.array(ValueAxisSchema).min(1),
  format: PostFormatSchema.default("carousel"),
  durability: DurabilitySchema.default("evergreen"),
  /** Index into BrandIntelligence.proofAssets, if the concept leans on proof. */
  proofRef: z.number().optional(),
});
export type PostConcept = z.infer<typeof PostConceptSchema>;

export const ImageBriefSchema = z.object({
  role: z.enum(["background", "hero", "product"]).default("background"),
  prompt: z.string(),
  negativePrompt: z.string().default(""),
  refImages: z.array(z.string()).default([]),
  style: z.string().default(""),
  palette: z.array(z.string()).default([]),
  aspectRatio: z.string().default("4:5"),
});
export type ImageBrief = z.infer<typeof ImageBriefSchema>;

/**
 * A slide is archetype-driven. `archetype` selects a layout in the carousel
 * grammar; `fields` carries that layout's named text slots. Emphasis markers
 * `{word}` (highlight) and `|` (line break) are honoured by the renderer.
 */
export const SlideSchema = z.object({
  n: z.number().int().positive(),
  archetype: z.string(),
  fields: z.record(z.union([z.string(), z.array(z.string())])).default({}),
  image: ImageBriefSchema.optional(),
});
export type Slide = z.infer<typeof SlideSchema>;

export const CaptionSchema = z.object({
  instagram: z.string().default(""),
  linkedin: z.string().default(""),
});
export type Caption = z.infer<typeof CaptionSchema>;

export const CarouselSpecSchema = z.object({
  conceptId: z.string(),
  format: PostFormatSchema.default("carousel"),
  title: z.string().default(""),
  slides: z.array(SlideSchema).min(1),
  caption: CaptionSchema,
  hashtags: z.array(z.string()).default([]),
  cta: z.object({
    label: z.string().default(""),
    meta: z.string().default(""),
    url: z.string().optional(),
  }),
  designTokens: DesignTokensSchema,
  valueAxis: z.array(ValueAxisSchema).default([]),
});
export type CarouselSpec = z.infer<typeof CarouselSpecSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Stage 5 — RENDER  (final artifacts)
// ─────────────────────────────────────────────────────────────────────────

export const RenderedSlideSchema = z.object({
  n: z.number(),
  archetype: z.string(),
  pngPath: z.string(),
});
export type RenderedSlide = z.infer<typeof RenderedSlideSchema>;

export const ContentKitSchema = z.object({
  brand: BrandInputSchema,
  concept: PostConceptSchema,
  spec: CarouselSpecSchema,
  slides: z.array(RenderedSlideSchema).default([]),
  caption: CaptionSchema,
  rationale: z.string().default(""),
  generatedAt: z.string(),
});
export type ContentKit = z.infer<typeof ContentKitSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Run envelope — everything produced by one company → content run
// ─────────────────────────────────────────────────────────────────────────

export const RunResultSchema = z.object({
  brand: BrandInputSchema,
  footprint: CompanyFootprintSchema,
  intelligence: BrandIntelligenceSchema,
  playbook: VisualPlaybookSchema,
  concepts: z.array(PostConceptSchema),
  kits: z.array(ContentKitSchema),
  startedAt: z.string(),
  finishedAt: z.string(),
});
export type RunResult = z.infer<typeof RunResultSchema>;
