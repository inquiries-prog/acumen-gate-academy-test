import ResultsEditor from "./ResultsEditor";
import { readRows } from "@/lib/admin/data";
import type { ResultEntry, ResultYear } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Results page",
  robots: { index: false, follow: false },
};

export default async function AdminResultsPage() {
  const [years, entries] = await Promise.all([
    readRows<ResultYear>("result_years"),
    readRows<ResultEntry>("result_entries"),
  ]);

  return <ResultsEditor years={years} entries={entries} />;
}
