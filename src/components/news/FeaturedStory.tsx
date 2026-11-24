import Link from "next/link";
import { NEWS_CATEGORIES } from "@/lib/defaults";
import type { NewsPost } from "@/lib/types";
import { formatDate, readingMinutes } from "@/lib/utils";
import NewsCover from "./NewsCover";

/**
 * The featured story, as a compact card that sits in the News & Updates hero
 * beside the page heading: cover on top, then tags, title, a short summary
 * and "Read the story".
 */
export default function FeaturedStory({ post }: { post: NewsPost }) {
  const label = NEWS_CATEGORIES.find((c) => c.key === post.category)?.label ?? "Update";
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group block overflow-hidden rounded-3xl border border-line bg-white shadow-lifted transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-card-hover"
    >
      <NewsCover
        category={post.category}
        coverUrl={post.cover_url}
        alt={post.title}
        priority
        sizes="(max-width: 1024px) 100vw, 480px"
        className="aspect-[16/8] transition-transform duration-700 ease-smooth group-hover:scale-[1.02]"
      />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red/[0.08] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-red">
            ★ Featured
          </span>
          <span className="rounded-full bg-charcoal px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">{label}</span>
        </div>
        <h2 className="mt-3 font-display text-xl font-bold leading-snug text-charcoal transition-colors group-hover:text-red sm:text-[1.4rem]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-muted">
            {formatDate(post.published_at)} · {readingMinutes(post.content)} min read
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-red">
            Read the story
            <span className="grid h-7 w-7 place-items-center rounded-full bg-red/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-red group-hover:text-white">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
