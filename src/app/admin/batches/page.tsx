import BatchesEditor from "./BatchesEditor";
import { readRows } from "@/lib/admin/data";
import type { Batch, Branch } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Batches, dates & fees",
  robots: { index: false, follow: false },
};

export default async function AdminBatchesPage() {
  const [branches, batches] = await Promise.all([
    readRows<Branch>("branches"),
    readRows<Batch>("batches"),
  ]);

  return <BatchesEditor branches={branches} batches={batches} />;
}
