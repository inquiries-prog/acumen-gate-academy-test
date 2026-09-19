import { renderBrandIcon } from "@/lib/brand-icon";

/** iOS home-screen icon. Same renderer as the favicon, at Apple's 180px. */
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderBrandIcon(180);
}
