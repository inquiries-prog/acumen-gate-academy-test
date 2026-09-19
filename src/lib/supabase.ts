import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

/**
 * The site is designed to run before Supabase exists, falling back to the seed
 * content in defaults.ts. Everything that touches the database checks this
 * first rather than throwing.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function hasServiceRole(): boolean {
  return Boolean(url && serviceKey);
}

let publicClient: SupabaseClient | null = null;

/** Read-only client for public content. Subject to RLS (select-only policies). */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClient) {
    publicClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

let serviceClient: SupabaseClient | null = null;

/**
 * Server-only client. Bypasses RLS, so it is the only thing that can read or
 * write leads, enrollments and admin content. Never import into a Client
 * Component - the service key must not reach the browser.
 */
export function getServiceClient(): SupabaseClient | null {
  if (!hasServiceRole()) return null;
  if (!serviceClient) {
    serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}
