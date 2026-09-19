"use client";

import Modal from "@/components/ui/Modal";

/**
 * Inline video popup (SRS 7.1.6) - the visitor is never sent off-site to
 * YouTube. The iframe is created only when this component mounts, i.e. only
 * once someone actually opens a demo, so no video weight is on initial page
 * load (SRS 3.5).
 */
export default function VideoModal({
  open,
  videoId,
  start = 0,
  title = "Demo lecture",
  onClose,
}: {
  open: boolean;
  videoId: string;
  start?: number;
  title?: string;
  onClose: () => void;
}) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (start > 0) params.set("start", String(start));

  return (
    <Modal open={open} onClose={onClose} size="xl" bare>
      <div className="overflow-hidden rounded-2xl bg-charcoal">
        <div className="relative aspect-video w-full">
          <iframe
            // youtube-nocookie avoids setting tracking cookies before playback.
            src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <p className="px-4 py-3 text-sm font-medium text-white/90">{title}</p>
      </div>
    </Modal>
  );
}
