/**
 * Apify social adapter. Runs per-platform actors synchronously and normalizes
 * their dataset items into SocialProfile. Instagram is the primary path;
 * LinkedIn/TikTok are best-effort. Override actor ids via env if needed.
 *
 * NOTE: actor input/output shapes drift; gate with a small pilot before backfill.
 */
import { type SocialPost, type SocialProfile } from "../../types.js";
import { log } from "../../util/logger.js";
import type { SocialAdapter } from "../interfaces.js";

const BASE = "https://api.apify.com/v2";

const ACTORS: Record<string, string> = {
  instagram: process.env.APIFY_ACTOR_INSTAGRAM || "apify~instagram-scraper",
  linkedin:
    process.env.APIFY_ACTOR_LINKEDIN || "harvestapi~linkedin-company-posts",
  tiktok: process.env.APIFY_ACTOR_TIKTOK || "clockworks~tiktok-profile-scraper",
};

export class ApifySocial implements SocialAdapter {
  readonly name = "apify-social";
  private token = process.env.APIFY_TOKEN ?? "";

  private async run(actor: string, input: unknown): Promise<any[]> {
    const res = await fetch(
      `${BASE}/acts/${actor}/run-sync-get-dataset-items?token=${this.token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!res.ok) throw new Error(`apify ${actor} ${res.status}`);
    return (await res.json()) as any[];
  }

  async fetchProfile(
    platform: string,
    handle: string,
    opts?: { limit?: number },
  ): Promise<SocialProfile | null> {
    const actor = ACTORS[platform];
    if (!actor) {
      log.warn(`no apify actor for ${platform}`);
      return null;
    }
    const limit = opts?.limit ?? 12;
    try {
      const items = await this.run(actor, buildInput(platform, handle, limit));
      return normalize(platform, handle, items);
    } catch (e) {
      log.warn(`apify ${platform} @${handle} failed:`, String(e));
      return null;
    }
  }
}

function buildInput(platform: string, handle: string, limit: number): unknown {
  const h = handle.replace(/^@/, "");
  switch (platform) {
    case "instagram":
      return {
        directUrls: [`https://www.instagram.com/${h}/`],
        resultsType: "posts",
        resultsLimit: limit,
      };
    case "linkedin":
      return { companies: [h], maxPosts: limit };
    case "tiktok":
      return { profiles: [h], resultsPerPage: limit };
    default:
      return { handle: h, limit };
  }
}

function normalize(
  platform: string,
  handle: string,
  items: any[],
): SocialProfile {
  const posts: SocialPost[] = items
    .filter((it) => it && (it.caption || it.text || it.title))
    .slice(0, 20)
    .map((it) => ({
      platform,
      url: it.url ?? it.postUrl,
      caption: it.caption ?? it.text ?? it.title ?? "",
      likes: it.likesCount ?? it.likes ?? it.reactionsCount,
      comments: it.commentsCount ?? it.comments,
      postedAt: it.timestamp ?? it.date ?? it.publishedAt,
      mediaType: mapMedia(it.type ?? it.mediaType),
      themes: [],
    }));
  const first = items[0] ?? {};
  return {
    platform,
    handle,
    followers: first.followersCount ?? first.followers,
    bio: first.biography ?? first.bio ?? "",
    posts,
    topThemes: [],
    avgEngagement: undefined,
  };
}

function mapMedia(t: unknown): SocialPost["mediaType"] {
  const s = String(t ?? "").toLowerCase();
  if (s.includes("carousel") || s.includes("sidecar")) return "carousel";
  if (s.includes("video") || s.includes("reel")) return "video";
  if (s.includes("image") || s.includes("photo")) return "image";
  return "image";
}
