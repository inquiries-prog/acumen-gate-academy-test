import { renderBrandIcon } from "@/lib/brand-icon";

/**
 * Favicon and PWA icons, generated from the real logo mark at build time.
 * /icon/32 is the favicon; 192 and 512 are referenced by manifest.ts.
 */
export const dynamic = "force-static";
export const contentType = "image/png";

const SIZES = [32, 192, 512];

export function generateImageMetadata() {
  return SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType,
  }));
}

// Next 16: with generateImageMetadata, `id` arrives as a Promise<string>.
// Treating it as a plain string silently rendered every size at 32px.
export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  return renderBrandIcon(SIZES.includes(size) ? size : 32);
}
