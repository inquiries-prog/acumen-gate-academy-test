import { ImageResponse } from "next/og";
import { logoDataUrl } from "@/lib/brand-icon";
import { siteSettings } from "@/lib/defaults";

/**
 * The preview card shown when the site is shared - on WhatsApp above all,
 * which is how this audience passes links around.
 *
 * Built from defaults.ts rather than getSiteSettings() so it is generated once
 * at build with no database call. Palette only: white ground, red wash, the
 * client's real wordmark, and the one headline number the site is allowed to
 * use (SRS 7.1.3).
 */
export const dynamic = "force-static";
export const alt = "Acumen Gate Academy - GATE & GPSC coaching in Vadodara since 2014";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await logoDataUrl();
  const { hero_headline, hero_tagline, stat_line } = siteSettings;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "radial-gradient(60% 70% at 88% 4%, rgba(227,30,36,0.13), transparent 62%), radial-gradient(45% 55% at 4% 100%, rgba(227,30,36,0.08), transparent 60%), #FFFFFF",
          color: "#231F20",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={380} height={Math.round((380 * 440) / 1103)} />

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>
            {hero_headline}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#E31E24", lineHeight: 1.2 }}>
            {hero_tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              background: "#E31E24",
              color: "#FFFFFF",
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {stat_line}
          </div>
          <div style={{ fontSize: 22, color: "#767671" }}>Vadodara · Offline &amp; live online</div>
        </div>
      </div>
    ),
    size,
  );
}
