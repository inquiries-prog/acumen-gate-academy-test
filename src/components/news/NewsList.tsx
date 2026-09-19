"use client";

import { useState } from "react";
import Link from "next/link";
import { useSiteUI } from "@/components/site/SiteUI";
import type { NewsPost } from "@/lib/types";
import { formatDate, toParagraphs } from "@/lib/utils";

/**
 * News & Updates list (SRS 7.3).
 *
 * "Read more" expands the full post inline with no page load. Each post also
 * has its own URL at /news/[slug] for search engines, which is why the full
 * text is rendered from data already on the page rather than fetched on expand.
 *
 * Every post ends with a tie-back to Acumen's services and an enquiry CTA.
 */
export default function NewsList({ posts }: { posts: NewsPost[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { openEnquiry } = useSiteUI();

  if (posts.length === 0) {
    return (
      <div className="container-site py-16">
        <p className="text-center text-body">
          No updates have been published yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="container-site max-w-3xl py-12 md:py-14">
      <ul className="space-y-4">
        {posts.map((post) => {
          const open = openId === post.id;
          return (
            <li key={post.id} className="card-interactive p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {formatDate(post.published_at)}
              </p>
              <h2 className="mt-2.5 font-display text-xl font-bold leading-snug sm:text-2xl">
                <Link href={`/news/${post.slug}`} className="transition-colors hover:text-red">
                  {post.title}
                </Link>
              </h2>

              {post.excerpt && (
                <p className="mt-2.5 text-[15px] leading-relaxed text-body">{post.excerpt}</p>
              )}

              <div id={`post-${post.id}`} hidden={!open} className="mt-4 space-y-3.5">
                {toParagraphs(post.content).map((p, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-body">
                    {p}
                  </p>
                ))}
                <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openEnquiry(`News post: ${post.title}`)}
                    className="btn-primary"
                  >
                    Enquire Now
                  </button>
                  <Link href={`/news/${post.slug}`} className="btn-secondary">
                    Open full page
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenId(open ? null : post.id)}
                aria-expanded={open}
                aria-controls={`post-${post.id}`}
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-red"
              >
                {open ? "Show less" : "Read more"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
