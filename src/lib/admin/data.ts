import { getServiceClient } from "@/lib/supabase";

/**
 * Admin reads.
 *
 * These go through the service-role client so hidden rows and lead tables are
 * visible - public RLS policies deliberately hide both from everyone else.
 */

export async function readRows<T>(
  table: string,
  orderBy: { column: string; ascending?: boolean } = { column: "sort_order" },
): Promise<T[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy.column, { ascending: orderBy.ascending ?? true });
  if (error) {
    console.error(`[admin] read ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export async function countRows(table: string, filter?: Record<string, unknown>): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) return 0;
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filter ?? {})) {
    query = query.eq(key, value);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`[admin] count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/** Rows created in the last N days, for the dashboard summary. */
export async function countRecent(table: string, days = 7): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) return 0;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);
  if (error) return 0;
  return count ?? 0;
}
