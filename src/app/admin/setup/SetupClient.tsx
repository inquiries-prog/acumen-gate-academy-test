"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { seedDatabase, type SeedResult } from "@/lib/admin/seed";

export default function SetupClient({ alreadySeeded }: { alreadySeeded: boolean }) {
  const [result, setResult] = useState<SeedResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">First-time setup</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
          This loads the starting content — the six branches, the mentors, the FAQ, the Why Choose
          cards, the About Us text and the rest — into your database, so you can edit real content
          rather than starting from nothing.
        </p>
      </header>

      <div className="card p-5">
        <h2 className="text-base font-bold">
          {alreadySeeded ? "Your content is already loaded" : "Load the starting content"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          {alreadySeeded
            ? "You've already run this. Running it again is safe — anything you've edited is left exactly as it is, and only completely empty sections would be filled in."
            : "This is safe to run. It only fills in sections that are completely empty, so it can never overwrite something you've written."}
        </p>

        {result && (
          <div
            className={`mt-4 rounded-md px-3.5 py-3 text-sm ${
              result.ok ? "bg-green-50 text-green-800" : "bg-red/5 text-red-dark"
            }`}
            role="status"
          >
            <p className="font-semibold">{result.ok ? `✓ ${result.message}` : result.message}</p>
            {result.skipped.length > 0 && (
              <p className="mt-1 text-xs">
                Left untouched because they already had content: {result.skipped.join(", ")}.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setResult(await seedDatabase());
              })
            }
            className="btn-primary"
          >
            {pending ? "Loading…" : alreadySeeded ? "Run again" : "Load starting content"}
          </button>
          <Link href="/admin" className="btn-secondary">
            Go to the dashboard
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-bold">What to do next</h2>
        <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-body">
          <Step n={1}>
            Upload your logo in <Ref href="/admin/settings">Banner, hero &amp; contact details</Ref>.
          </Step>
          <Step n={2}>
            Add your result and newspaper images in{" "}
            <Ref href="/admin/c/gallery">Result &amp; press images</Ref>.
          </Step>
          <Step n={3}>
            Put the real start dates, faculty and fees into{" "}
            <Ref href="/admin/batches">Batches, dates &amp; fees</Ref>.
          </Step>
          <Step n={4}>
            Add this year&apos;s students in <Ref href="/admin/results">Results page</Ref>.
          </Step>
          <Step n={5}>
            Write the offer each college&apos;s students should see in{" "}
            <Ref href="/admin/c/seminar-offers">Seminar offers by college</Ref>.
          </Step>
          <Step n={6}>
            Paste your Privacy Policy and Terms into{" "}
            <Ref href="/admin/c/legal">Privacy Policy &amp; Terms</Ref> — both are required before
            going live, because online payment is live from day one.
          </Step>
        </ol>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red/10 text-[11px] font-bold text-red">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function Ref({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-red hover:underline">
      {children}
    </Link>
  );
}
