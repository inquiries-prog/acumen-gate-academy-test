"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  BatchMode,
  BranchBatch,
  GalleryImage,
  PedagogyPoint,
  SiteSettings,
  University,
} from "@/lib/types";

/**
 * Shared interactive state for the whole site.
 *
 * SRS 7.1.2 records a real bug from prototyping where the carousel and its
 * lightbox stopped working once page routing was introduced. The cause of that
 * class of bug is per-page modal state. Here every popup is owned by one
 * provider mounted above <main> in the root layout, so navigating between
 * routes never unmounts or resets it.
 *
 * Popups form a stack rather than a single slot, so chained flows work and
 * "close" steps back: batches -> batch detail -> enroll, or batches -> enquiry.
 */

/** Values a caller already knows, carried into the enquiry popup. */
export interface EnquiryPrefill {
  phone?: string;
}

export type ModalEntry =
  | { kind: "enquiry"; source: string; batchLabel?: string; prefill?: EnquiryPrefill }
  | { kind: "seminar" }
  | { kind: "batches"; mode: BatchMode }
  | { kind: "batchDetail"; branchId: string; mode: BatchMode }
  | { kind: "enroll"; branchId: string; mode: BatchMode }
  | { kind: "video"; videoId: string; start?: number; title?: string }
  | { kind: "lightbox"; images: GalleryImage[]; index: number };

export interface SiteData {
  settings: SiteSettings;
  formOptions: Record<string, string[]>;
  universities: University[];
  offline: BranchBatch[];
  online: BranchBatch[];
  pedagogy: PedagogyPoint[];
}

interface SiteUIContextValue extends SiteData {
  stack: ModalEntry[];
  current: ModalEntry | null;
  push: (entry: ModalEntry) => void;
  /** Steps back one level, returning to whatever opened this popup. */
  pop: () => void;
  /** Replaces the whole stack - used when a popup supersedes rather than nests. */
  replace: (entry: ModalEntry) => void;
  closeAll: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  /** True while a lightbox is open, so the carousel pauses (SRS 7.1.2). */
  lightboxOpen: boolean;
  batchesFor: (mode: BatchMode) => BranchBatch[];
  findBranchBatch: (branchId: string, mode: BatchMode) => BranchBatch | null;
  openEnquiry: (source: string, batchLabel?: string, prefill?: EnquiryPrefill) => void;
}

const SiteUIContext = createContext<SiteUIContextValue | null>(null);

export function useSiteUI(): SiteUIContextValue {
  const ctx = useContext(SiteUIContext);
  if (!ctx) throw new Error("useSiteUI must be used inside <SiteUIProvider>");
  return ctx;
}

export function SiteUIProvider({
  data,
  children,
}: {
  data: SiteData;
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<ModalEntry[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  const push = useCallback((entry: ModalEntry) => setStack((s) => [...s, entry]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const replace = useCallback((entry: ModalEntry) => setStack([entry]), []);
  const closeAll = useCallback(() => setStack([]), []);

  const batchesFor = useCallback(
    (mode: BatchMode) => (mode === "offline" ? data.offline : data.online),
    [data.offline, data.online],
  );

  const findBranchBatch = useCallback(
    (branchId: string, mode: BatchMode) =>
      batchesFor(mode).find((bb) => bb.branch.id === branchId) ?? null,
    [batchesFor],
  );

  const openEnquiry = useCallback(
    (source: string, batchLabel?: string, prefill?: EnquiryPrefill) => {
      // Closing the chat first stops it sitting on top of the form on mobile.
      setChatOpen(false);
      push({ kind: "enquiry", source, batchLabel, prefill });
    },
    [push],
  );

  const current = stack.length > 0 ? stack[stack.length - 1] : null;

  const value = useMemo<SiteUIContextValue>(
    () => ({
      ...data,
      stack,
      current,
      push,
      pop,
      replace,
      closeAll,
      chatOpen,
      setChatOpen,
      lightboxOpen: stack.some((e) => e.kind === "lightbox"),
      batchesFor,
      findBranchBatch,
      openEnquiry,
    }),
    [
      data,
      stack,
      current,
      push,
      pop,
      replace,
      closeAll,
      chatOpen,
      batchesFor,
      findBranchBatch,
      openEnquiry,
    ],
  );

  return <SiteUIContext.Provider value={value}>{children}</SiteUIContext.Provider>;
}
