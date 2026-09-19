import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Both faces are self-hosted by next/font at build time - no request to Google
 * at runtime, and no layout shift, which matters because SRS 3.5 makes fast
 * load a hard requirement.
 *
 * Only the weights actually used are requested, to keep the payload small.
 */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * viewport-fit=cover lets content extend under the iPhone home indicator, which
 * is what makes env(safe-area-inset-bottom) non-zero. Every fixed-bottom element
 * (sticky bar, bottom sheet, chat, mobile menu, footer clearance) pads by it.
 *
 * interactiveWidget=resizes-content: on Chrome Android the on-screen keyboard
 * shrinks the layout viewport, so a fixed bottom sheet's submit button stays
 * reachable while a field is focused.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GATE Coaching in Vadodara, Gujarat | Acumen Gate Academy",
    template: "%s | Acumen Gate Academy",
  },
  description:
    "Acumen Gate Academy has been coaching GATE aspirants in Vadodara since 2014, with 10,000+ GATE success stories.",
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "en_IN", siteName: "Acumen Gate Academy" },
};

/**
 * Root layout - the HTML document only.
 *
 * The public site's header, footer, popups and chat live in (site)/layout.tsx,
 * and the admin panel has its own shell, so the two never inherit each other's
 * chrome.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
