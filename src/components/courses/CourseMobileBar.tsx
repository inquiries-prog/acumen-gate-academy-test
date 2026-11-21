"use client";

import { useEffect, useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import { formatPrice } from "@/lib/utils";


/**
 * Phones only: on a course page, the site-wide sticky bar is replaced by this
 * one - the course's starting fee on the left, and "Free demo" and "Batches"
 * on the right, so the two decisions a student makes on this page are always
 * one tap away. (StickyMobileCta hides itself on course pages.)
 */
export default function CourseMobileBar({
  fromFee,
  courseTitle,
  branchOption,
  hasBatches,
}: {
  fromFee: number | null;
  courseTitle: string;
  branchOption?: string;
  hasBatches: boolean;
}) {
  const { openDemo, openEnquiry, current, chatOpen, demo } = useSiteUI();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = !visible || current !== null || chatOpen || demo.open;

  return (
    <div
      aria-hidden={hidden}
      className={`fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl
                  transition-transform duration-300 ease-smooth lg:hidden ${hidden ? "translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1 pl-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{fromFee ? "From" : "Fees"}</p>
          <p className="truncate font-display text-lg font-extrabold leading-tight text-charcoal">
            {fromFee ? formatPrice(fromFee) : "Ask us"}
          </p>
        </div>
        <button
          type="button"
          tabIndex={hidden ? -1 : 0}
          onClick={() => openDemo(`Course mobile bar: ${courseTitle}`, { branch: branchOption })}
          className="btn-primary btn-sm px-4"
        >
          🎓 Free demo
        </button>
        {hasBatches ? (
          <a href="#batches" tabIndex={hidden ? -1 : 0} className="btn-secondary btn-sm px-4">
            Batches
          </a>
        ) : (
          <button
            type="button"
            tabIndex={hidden ? -1 : 0}
            onClick={() => openEnquiry(`Course mobile bar: ${courseTitle}`)}
            className="btn-secondary btn-sm px-4"
          >
            Enquire
          </button>
        )}
      </div>
    </div>
  );
}
