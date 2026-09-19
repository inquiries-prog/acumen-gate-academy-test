import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, APIs and the payment flow must never be indexed.
      disallow: ["/admin", "/admin/", "/api/", "/enroll/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
