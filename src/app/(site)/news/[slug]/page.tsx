import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FinalCta from "@/components/site/FinalCta";
import { getNewsPost, getNewsPosts } from "@/lib/content";
import { formatDate, toParagraphs } from "@/lib/utils";

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

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
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

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
          {formatDate(post.published_at)}
        </p>
        <h1 className="mt-3 text-display-md">{post.title}</h1>

        {post.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-charcoal sm:text-[17px]">
            {post.excerpt}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {toParagraphs(post.content).map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-body sm:text-base">
              {p}
            </p>
          ))}
        </div>
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
