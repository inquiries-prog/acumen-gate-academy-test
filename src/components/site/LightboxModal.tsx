"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import type { GalleryImage } from "@/lib/types";

/**
 * Shared image lightbox (SRS 7.1.2 and 7.2.7).
 *
 * One component for both the homepage carousel and the About page press strip -
 * the SRS asks explicitly for reuse rather than a second implementation. While
 * this is open the carousel's auto-scroll pauses, and resumes on close.
 */
export default function LightboxModal({
  open,
  images,
  index,
  onClose,
}: {
  open: boolean;
  images: GalleryImage[];
  index: number;
  onClose: () => void;
}) {
  const [active, setActive] = useState(index);

  useEffect(() => setActive(index), [index]);

  const go = useCallback(
    (delta: number) => {
      setActive((i) => (i + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!open || images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length, go]);

  if (images.length === 0) return null;
  const image = images[Math.min(active, images.length - 1)];

  return (
    <Modal open={open} onClose={onClose} size="xl" bare>
      <div className="relative">
        <div className="relative mx-auto flex max-h-[78vh] items-center justify-center overflow-hidden rounded-2xl bg-charcoal">
          {image.image_url ? (
            <Image
              src={image.image_url}
              alt={image.alt_text || "Acumen Gate Academy"}
              width={1400}
              height={1400}
              // Contain, so tall newspaper clippings are never cropped.
              className="max-h-[78vh] w-auto object-contain"
              priority
            />
          ) : (
            <div className="grid h-64 w-full place-items-center text-sm text-white/70">
              Image not available
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
            <p className="mt-3 text-center text-sm text-white/90">
              {active + 1} / {images.length}
            </p>
          </>
        )}

        {image.alt_text && (
          <p className="mx-auto mt-1 max-w-xl text-center text-sm text-white/80">
            {image.alt_text}
          </p>
        )}
      </div>
    </Modal>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full
                  bg-charcoal/70 text-white transition-colors hover:bg-charcoal
                  ${side === "left" ? "left-2" : "right-2"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
