"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  Batch,
  Branch,
  CourseNavItem,
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
 * "close" steps back: enroll -> enquiry, video -> enquiry.
 *
 * Courses used to live in two popups (offline / online batches). They are now
 * real pages under /courses, so the only course popup left is the enroll
 * sheet, opened from a batch on a course page.
 *
 * The free demo side panel is separate from the stack: it slides in from the
 * side over whatever page is open and has its own open/closed state.
 */

/** Values a caller already knows, carried into the enquiry popup. */
export interface EnquiryPrefill {
  phone?: string;
}

/** Values a caller already knows, carried into the free demo panel. */
export interface DemoPrefill {
  /** Matches a "branch" form option label, e.g. "Mechanical Engineering (ME)". */
  branch?: string;
  /** Matches an "enquiry_for" form option label, e.g. "Online". */
  mode?: string;
}

export type ModalEntry =
  | { kind: "enquiry"; source: string; batchLabel?: string; prefill?: EnquiryPrefill }
  | { kind: "seminar" }
  | { kind: "enroll"; batchId: string }
  | { kind: "video"; videoId: string; start?: number; title?: string }
  | { kind: "lightbox"; images: GalleryImage[]; index: number };

export interface SiteData {
  settings: SiteSettings;
  formOptions: Record<string, string[]>;
  universities: University[];
  branches: Branch[];
  batches: Batch[];
  courses: CourseNavItem[];
  pedagogy: PedagogyPoint[];
}

interface DemoState {
  open: boolean;
  source: string;
  prefill?: DemoPrefill;
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
  openEnquiry: (source: string, batchLabel?: string, prefill?: EnquiryPrefill) => void;
  demo: DemoState;
  /** Opens the free demo side panel. `source` is recorded against the lead. */
  openDemo: (source: string, prefill?: DemoPrefill) => void;
  closeDemo: () => void;
  findBatch: (batchId: string) => { batch: Batch; branch: Branch | null } | null;
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
  const [demo, setDemo] = useState<DemoState>({ open: false, source: "" });

  const push = useCallback((entry: ModalEntry) => setStack((s) => [...s, entry]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const replace = useCallback((entry: ModalEntry) => setStack([entry]), []);
  const closeAll = useCallback(() => setStack([]), []);

  const openEnquiry = useCallback(
    (source: string, batchLabel?: string, prefill?: EnquiryPrefill) => {
      // Closing the chat first stops it sitting on top of the form on mobile.
      setChatOpen(false);
      setDemo((d) => ({ ...d, open: false }));
      push({ kind: "enquiry", source, batchLabel, prefill });
    },
    [push],
  );

  const openDemo = useCallback((source: string, prefill?: DemoPrefill) => {
    setChatOpen(false);
    setStack([]);
    setDemo({ open: true, source, prefill });
  }, []);

  const closeDemo = useCallback(() => setDemo((d) => ({ ...d, open: false })), []);

  const findBatch = useCallback(
    (batchId: string) => {
      const batch = data.batches.find((b) => b.id === batchId);
      if (!batch) return null;
      return { batch, branch: data.branches.find((b) => b.id === batch.branch_id) ?? null };
    },
    [data.batches, data.branches],
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
      openEnquiry,
      demo,
      openDemo,
      closeDemo,
      findBatch,
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
      openEnquiry,
      demo,
      openDemo,
      closeDemo,
      findBatch,
    ],
  );

  return <SiteUIContext.Provider value={value}>{children}</SiteUIContext.Provider>;
}
