import type { MetadataRoute } from "next";

/**
 * Web app manifest, so "Add to Home Screen" on a phone installs the site with
 * the real logo mark as its icon. Served at /manifest.webmanifest and linked
 * automatically. Colours are palette values (SRS 3.1).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acumen Gate Academy",
    short_name: "Acumen GATE",
    description: "GATE & GPSC coaching in Vadodara, Gujarat, since 2014.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
