import type { Metadata } from "next";
import FeaturedStory from "@/components/news/FeaturedStory";
import NewsMagazine from "@/components/news/NewsMagazine";
import FinalCta from "@/components/site/FinalCta";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import { getKeyDates, getNewsPosts, getPageSeo } from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/news");
  return {
    title: seo?.meta_title ? { absolute: seo.meta_title } : undefined,
    description: seo?.meta_description,
    alternates: { canonical: "/news" },
  };
}

/**
 * News & Updates (SRS 7.3).
 *
 * The strategy is to rank fast on PSU/government recruitment notifications and
 * bring in GATE-relevant traffic. The publishing flow in the admin panel is
 * deliberately minimal (title, excerpt, content, publish) because a stale news
 * page is worse than no news page, so posting has to stay low-friction.
 */
export default async function NewsPage() {
  const [posts, dates] = await Promise.all([getNewsPosts(), getKeyDates()]);
  // The newest post marked featured (else the newest post) leads the page.
  const featured = posts.find((p) => p.featured) ?? posts[0];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        <AmbientGlow />
        <div className="container-site relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-14">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              News &amp; Updates
            </p>
            <h1 className="mt-6 text-display-lg">
              Stay Updated on GATE &amp; PSU Recruitment News
            </h1>
            <p className="lede mt-5 max-w-2xl">
              Recruitment notifications, eligibility changes and GATE announcements — explained in
              terms of what they actually mean for your preparation.
            </p>
          </Reveal>
          {featured && (
            <Reveal variant="right" distance="lg" delay={120}>
              <FeaturedStory post={featured} />
            </Reveal>
          )}
        </div>
      </section>

      <NewsMagazine posts={posts} dates={dates} featuredId={featured?.id} />

      <FinalCta source="News page CTA" />
    </>
  );
}
