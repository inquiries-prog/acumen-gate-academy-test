import type { MetadataRoute } from "next";
import { getNewsPosts } from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** SRS 13: sitemap for Search Console, including every published news post. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getNewsPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/results`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/news`, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...posts.map((p) => ({
      url: `${base}/news/${p.slug}`,
      lastModified: new Date(p.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
