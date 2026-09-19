import Link from "next/link";
import { countRecent, countRows } from "@/lib/admin/data";
import { gstDetailsConfigured, getPaymentProvider } from "@/lib/payments";
import { getMessagingProvider } from "@/lib/messaging";

export const dynamic = "force-dynamic";

/**
 * Admin dashboard (SRS 9.1).
 *
 * Lead counts are the first thing visible on sign-in, because chasing leads is
 * the daily job. Below that, a plain-language checklist of what still has to be
 * supplied before launch (SRS 12) - so those blockers stay visible instead of
 * living only in a document.
 */
export default async function AdminDashboard() {
  const [
    enquiries,
    enquiriesNew,
    seminar,
    seminarNew,
    paid,
    abandoned,
    galleryCount,
    resultCount,
  ] = await Promise.all([
    countRows("general_enquiries"),
    countRows("general_enquiries", { contacted: false }),
    countRows("seminar_leads"),
    countRows("seminar_leads", { contacted: false }),
    countRows("enrollments", { status: "paid" }),
    countRows("enrollments", { status: "initiated" }),
    countRows("gallery_images"),
    countRows("result_entries"),
  ]);

  const recentEnquiries = await countRecent("general_enquiries", 7);

  const payment = getPaymentProvider();
  const messaging = getMessagingProvider();

  // Launch blockers, checked live rather than from a stale list.
  const checklist = [
    {
      done: payment.isLive,
      label: "Payment gateway connected",
      detail: payment.isLive
        ? `Using ${payment.name}.`
        : "No gateway chosen yet — online payment can't take real money until this is set up.",
    },
    {
      done: gstDetailsConfigured(),
      label: "GST details for invoices",
      detail: gstDetailsConfigured()
        ? "Business name and GSTIN are set."
        : "GSTIN and registered business name are missing — invoices can't be issued without them.",
    },
    {
      done: messaging.isLive,
      label: "SMS / WhatsApp confirmations",
      detail: messaging.isLive
        ? `Using ${messaging.name}.`
        : "No provider chosen yet — students aren't receiving confirmation messages.",
    },
    {
      done: Boolean(process.env.LEAD_NOTIFICATION_EMAIL),
      label: "Email alerts for new leads",
      detail: process.env.LEAD_NOTIFICATION_EMAIL
        ? `Alerts go to ${process.env.LEAD_NOTIFICATION_EMAIL}.`
        : "No notification email set — new leads are only visible here in the dashboard.",
    },
    {
      done: galleryCount > 0,
      label: "Result & press images uploaded",
      detail:
        galleryCount > 0
          ? `${galleryCount} image${galleryCount === 1 ? "" : "s"} in the library.`
          : "The homepage scrolling strip is empty until images are uploaded.",
    },
    {
      done: resultCount > 0,
      label: "Student results added",
      detail:
        resultCount > 0
          ? `${resultCount} result${resultCount === 1 ? "" : "s"} published.`
          : "The Results page has no student entries yet.",
    },
  ];

  const outstanding = checklist.filter((c) => !c.done).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1.5 text-sm text-body">
          {recentEnquiries > 0
            ? `${recentEnquiries} new enquir${recentEnquiries === 1 ? "y" : "ies"} in the last 7 days.`
            : "No new enquiries in the last 7 days."}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Leads</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            href="/admin/leads/enquiries"
            label="General enquiries"
            value={enquiries}
            badge={enquiriesNew > 0 ? `${enquiriesNew} to call` : undefined}
          />
          <StatCard
            href="/admin/leads/seminar"
            label="Seminar leads"
            value={seminar}
            badge={seminarNew > 0 ? `${seminarNew} to call` : undefined}
          />
          <StatCard href="/admin/leads/enrollments" label="Paid enrollments" value={paid} />
          <StatCard
            href="/admin/leads/enrollments"
            label="Unfinished payments"
            value={abandoned}
            badge={abandoned > 0 ? "follow up" : undefined}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Quick actions</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <QuickLink href="/admin/settings" title="Change the announcement banner" />
          <QuickLink href="/admin/batches" title="Update a batch date or fee" />
          <QuickLink href="/admin/c/news" title="Post a recruitment update" />
          <QuickLink href="/admin/results" title="Add this year's results" />
          <QuickLink href="/admin/c/gallery" title="Upload result or press images" />
          <QuickLink href="/admin/c/seminar-offers" title="Change a college's seminar offer" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
          Before the site goes live
          {outstanding > 0 && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-900">
              {outstanding} outstanding
            </span>
          )}
        </h2>
        <ul className="card divide-y divide-line">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-start gap-3 p-4">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  item.done ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"
                }`}
              >
                {item.done ? "✓" : "!"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-body">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  badge,
}: {
  href: string;
  label: string;
  value: number;
  badge?: string;
}) {
  return (
    <Link href={href} className="card p-4 transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-charcoal">{value}</p>
      {badge && (
        <span className="mt-1.5 inline-block rounded bg-red/10 px-2 py-0.5 text-[11px] font-bold text-red">
          {badge}
        </span>
      )}
    </Link>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="card flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-red/40 hover:text-red"
    >
      {title}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
