import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Renders the app icon at any size from the client's real logo file.
 *
 * The logo PNG (1103x440) is the lightbulb-head mark on the left followed by
 * the wordmark. An icon only has room for the mark, so the image is placed
 * inside a clipped window that shows its left ~270px. Nothing is redrawn or
 * recoloured - SRS 3.2 forbids altering the logo - it is the client's own
 * pixels, cropped.
 *
 * Read from disk rather than Supabase so it renders at build time with no
 * network call, and so the icon cannot change if the admin swaps the site logo.
 */

const LOGO_PATH = join(process.cwd(), "public/assets/logo/acumen-gate-academy-logo.png");
const LOGO_W = 1103;
const LOGO_H = 440;
/** Width of the mark within the logo file, before the wordmark begins. */
const MARK_W = 272;

let cached: Promise<string> | null = null;

/** Base64 data URL for the logo, read once per build process. */
export function logoDataUrl(): Promise<string> {
  cached ??= readFile(LOGO_PATH).then((buf) => `data:image/png;base64,${buf.toString("base64")}`);
  return cached;
}

export async function renderBrandIcon(size: number): Promise<ImageResponse> {
  const logo = await logoDataUrl();
  // The mark fills 84% of the tile height, centred.
  const scale = (size * 0.84) / LOGO_H;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#FFFFFF",
          borderRadius: Math.round(size * 0.22),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: MARK_W * scale,
            height: LOGO_H * scale,
            overflow: "hidden",
            position: "relative",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt=""
            width={LOGO_W * scale}
            height={LOGO_H * scale}
            style={{ position: "absolute", left: 0, top: 0 }}
          />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
