import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminUser } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin",
  // The admin panel must never be indexed.
  robots: { index: false, follow: false },
};

/**
 * Admin shell (SRS 9).
 *
 * Deliberately plain: a sidebar of plain-language links and a wide content
 * column. No public-site chrome, so the client is never confused about whether
 * they are looking at the website or editing it.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The login page renders inside this layout too, so a missing user here is
  // normal - the middleware handles redirecting.
  const user = await getAdminUser();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <div className="card p-7">
          <h1 className="text-xl font-bold">The database isn&apos;t connected yet</h1>
          <p className="mt-3 text-sm leading-relaxed text-body">
            The admin panel needs Supabase. Create a project, run the files in{" "}
            <code className="rounded bg-offwhite px-1.5 py-0.5 text-xs">supabase/migrations</code>,
            then put the project URL and keys in{" "}
            <code className="rounded bg-offwhite px-1.5 py-0.5 text-xs">.env.local</code> and
            restart. Full steps are in{" "}
            <code className="rounded bg-offwhite px-1.5 py-0.5 text-xs">docs/SETUP.md</code>.
          </p>
          <p className="mt-4 text-sm text-body">
            The public website works without this — it falls back to the starting content.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Login page: no navigation to show.
    return <div className="min-h-screen bg-offwhite">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-offwhite lg:flex">
      <AdminNav email={user.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
