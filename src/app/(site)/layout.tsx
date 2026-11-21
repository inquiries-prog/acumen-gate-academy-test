import AnnouncementBanner from "@/components/site/AnnouncementBanner";
import ChatWidget from "@/components/site/ChatWidget";
import DemoDrawer from "@/components/site/DemoDrawer";
import { DemoEdgeTab, DemoNudge } from "@/components/site/DemoHooks";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import ModalHost from "@/components/site/ModalHost";
import PageTransition from "@/components/site/PageTransition";
import StickyMobileCta from "@/components/site/StickyMobileCta";
import { SiteUIProvider } from "@/components/site/SiteUI";
import {
  getBatches,
  getBranches,
  getCenters,
  getCourseNav,
  getEcosystemCards,
  getFormOptions,
  getPedagogyPoints,
  getSiteSettings,
  getUniversities,
} from "@/lib/content";
import { HEAD_OFFICE_ADDRESS, PHONE_DISPLAY } from "@/lib/defaults";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Public site shell (SRS 6).
 *
 * The provider, popups and chat widget are mounted here, ABOVE the routed page
 * content, so navigating between pages never unmounts them. SRS 7.1.2 records a
 * real bug from prototyping where shared UI stopped working once routing was
 * introduced; owning that state at the layout level is what prevents it.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, formOptions, universities, branches, batches, courses, pedagogy, centers, ecosystem] =
    await Promise.all([
      getSiteSettings(),
      getFormOptions(),
      getUniversities(),
      getBranches(),
      getBatches(),
      getCourseNav(),
      getPedagogyPoints(),
      getCenters(),
      getEcosystemCards(),
    ]);
  const visibleBatches = batches.filter((b) => b.visible);

  const headOffice = centers.find((c) => c.show_address && c.address);

  // SRS 13: EducationalOrganization schema, with NAP identical to the footer.
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Acumen Gate Academy",
    url: siteUrl,
    telephone: settings.phone || PHONE_DISPLAY,
    email: settings.email || undefined,
    foundingDate: "2014",
    address: {
      "@type": "PostalAddress",
      streetAddress: headOffice?.address ?? HEAD_OFFICE_ADDRESS,
      addressLocality: "Vadodara",
      addressRegion: "Gujarat",
      postalCode: "390023",
      addressCountry: "IN",
    },
    aggregateRating: settings.google_rating
      ? {
          "@type": "AggregateRating",
          ratingValue: settings.google_rating,
          reviewCount: settings.google_reviews_count || undefined,
        }
      : undefined,
    sameAs: [settings.instagram_url, settings.youtube_url, settings.facebook_url].filter(Boolean),
  };

  return (
    <SiteUIProvider
      data={{ settings, formOptions, universities, branches, batches: visibleBatches, courses, pedagogy }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-red focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <Header />
      <AnnouncementBanner />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer centers={centers} ecosystem={ecosystem} />

      <ModalHost />
      <DemoDrawer />
      <DemoEdgeTab />
      <DemoNudge />
      <ChatWidget />
      <StickyMobileCta />

      <script
        type="application/ld+json"
        // Serialised server-side from our own data, never from visitor input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </SiteUIProvider>
  );
}
