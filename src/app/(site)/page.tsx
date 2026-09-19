import type { Metadata } from "next";
import Carousel from "@/components/home/Carousel";
import CoursesSection from "@/components/home/CoursesSection";
import Hero from "@/components/home/Hero";
import StatBand from "@/components/home/StatBand";
import MentorsSection from "@/components/home/MentorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import FinalCta from "@/components/site/FinalCta";
import {
  getCarouselImages,
  getCourseCards,
  getMentors,
  getPageSeo,
  getSiteSettings,
  getTestimonials,
  getWhyChooseCards,
} from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/");
  return {
    title: seo?.meta_title,
    description: seo?.meta_description,
    alternates: { canonical: "/" },
  };
}

/**
 * Homepage.
 *
 * The section order below is finalised in SRS 7.1 and must not be reordered
 * without checking with the client. Note there is deliberately NO pedagogy
 * section here - it was tried and removed for making the homepage too heavy,
 * and lives on the About page instead (SRS 7.2.4).
 */
export default async function HomePage() {
  const [settings, carousel, courses, whyChoose, testimonials, mentors] = await Promise.all([
    getSiteSettings(),
    getCarouselImages(),
    getCourseCards(),
    getWhyChooseCards(),
    getTestimonials("home"),
    getMentors(),
  ]);

  return (
    <>
      <Hero />

      <Carousel images={carousel} />

      {/* SRS 7.1.3: the only headline number used anywhere on this site. */}
      <StatBand statLine={settings.stat_line} />

      <CoursesSection cards={courses} />

      <WhyChooseSection cards={whyChoose} />

      <TestimonialsSection testimonials={testimonials} />

      <MentorsSection mentors={mentors} />

      <FinalCta source="Homepage final CTA" />
    </>
  );
}
