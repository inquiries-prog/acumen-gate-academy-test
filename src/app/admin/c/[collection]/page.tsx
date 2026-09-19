import { notFound } from "next/navigation";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { collections, getCollection } from "@/lib/admin/collections";
import { readRows } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ collection: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { collection } = await params;
  const def = getCollection(collection);
  return { title: def?.title ?? "Admin", robots: { index: false, follow: false } };
}

/**
 * One screen for every content list (SRS 9.2).
 *
 * The collection registry decides the fields, labels and help text, so all of
 * these sections behave identically for the client.
 */
export default async function CollectionPage({ params }: Params) {
  const { collection } = await params;
  const def = getCollection(collection);
  if (!def) notFound();

  const rows = await readRows<Record<string, unknown>>(
    def.table,
    def.orderBy ?? { column: "sort_order" },
  );

  return <CollectionEditor def={def} rows={rows} />;
}
