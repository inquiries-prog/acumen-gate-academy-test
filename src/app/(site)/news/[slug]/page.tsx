import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsCover from "@/components/news/NewsCover";
import BranchArt from "@/components/courses/BranchArt";
import FinalCta from "@/components/site/FinalCta";
import { NEWS_CATEGORIES } from "@/lib/defaults";
import { getCourses, getNewsPost, getNewsPosts } from "@/lib/content";
import NewsBody from "@/components/news/NewsBody";
import { formatDate, readingMinutes } from "@/lib/utils";
import { postImages } from "@/lib/post-html";
import { renderPostHtml } from "@/lib/post-render";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getNewsPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

/**
 * A URL per post (SRS 7.3) - the list page expands posts inline, but search
 * engines get a clean, individually-indexable page for each one.
 */
export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) notFound();
  const gateCourses = post.syllabus_links ? (await getCourses()).filter((c) => c.category === "gate") : [];

  const images = [
    post.cover_url,
    ...postImages(post.content),
  ].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    ...(images.length > 0 && { image: images }),
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Acumen Gate Academy" },
    publisher: { "@type": "Organization", name: "Acumen Gate Academy" },
  };

  return (
    <>
      <article className="container-site max-w-3xl py-12 md:py-16">
        <Link href="/news" className="text-sm font-semibold text-red hover:underline">
          ← All updates
        </Link>

        <NewsCover
          category={post.category}
          coverUrl={post.cover_url}
          alt={post.title}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="mt-6 aspect-[16/7] rounded-3xl border border-line"
        />

        <p className="mt-7 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span className="rounded-full bg-red/[0.08] px-2.5 py-1 font-bold text-red">
            {NEWS_CATEGORIES.find((c) => c.key === post.category)?.label ?? "Update"}
          </span>
          {formatDate(post.published_at)} · {readingMinutes(post.content)} min read
        </p>
        <h1 className="mt-3 text-display-md">{post.title}</h1>

        {post.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-charcoal sm:text-[17px]">
            {post.excerpt}
          </p>
        )}

        <NewsBody html={renderPostHtml(post.content)} title={post.title} />

        {gateCourses.length > 0 && (
          <section aria-labelledby="syllabus-links" className="mt-10 rounded-3xl border border-line bg-offwhite p-5 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red">Official syllabus PDFs</p>
            <h2 id="syllabus-links" className="mt-2 text-xl sm:text-2xl">
              Download the syllabus for your paper
            </h2>
            <p className="mt-1.5 text-sm text-body">
              Pick your branch: the course page shows the full syllabus and the official PDF download.
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gateCourses.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/courses/${c.slug}#syllabus`}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-chip transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-red/30 hover:shadow-card"
                  >
                    <span className="h-11 w-11 shrink-0 rounded-xl bg-offwhite">
                      <BranchArt code={c.branch_code} className="h-full w-full" animated={false} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-extrabold text-charcoal group-hover:text-red">
                        {c.short_title || c.title}
                      </span>
                      <span className="block text-[11px] font-semibold text-muted">
                        {c.branch_code === "CSE" ? "CS" : c.branch_code} syllabus + PDF →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/courses#syllabus-downloads" className="btn-primary mt-5 w-full sm:w-auto">
              See all courses and syllabus PDFs
            </Link>
          </section>
        )}
      </article>

      <FinalCta
        heading="Preparing for GATE with PSU roles in mind?"
        buttonLabel="Talk to us"
        source={`News post: ${post.title}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
