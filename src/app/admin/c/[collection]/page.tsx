import { notFound } from "next/navigation";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { collections, getCollection, type CollectionDef } from "@/lib/admin/collections";
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

  const [rows, resolved] = await Promise.all([
    readRows<Record<string, unknown>>(def.table, def.orderBy ?? { column: "sort_order" }),
    resolveOptions(def),
  ]);

  return <CollectionEditor def={resolved} rows={rows} />;
}

/**
 * Fills in select fields whose choices come from another table ("Which
 * course", "Which branch"). A field that isn't required gets a "None" choice.
 */
async function resolveOptions(def: CollectionDef): Promise<CollectionDef> {
  const fields = await Promise.all(
    def.fields.map(async (field) => {
      if (!field.optionsFrom) return field;
      const { table, value, label, orderBy } = field.optionsFrom;
      const rows = await readRows<Record<string, unknown>>(table, { column: orderBy ?? "sort_order" });
      const options = rows.map((r) => ({ value: String(r[value] ?? ""), label: String(r[label] ?? r[value] ?? "") }));
      return {
        ...field,
        optionsFrom: undefined,
        options: field.required ? options : [{ value: "", label: "None" }, ...options],
      };
    }),
  );
  return { ...def, fields };
}
