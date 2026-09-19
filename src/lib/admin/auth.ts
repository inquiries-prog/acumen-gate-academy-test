import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Admin authentication (SRS 9.1).
 *
 * Simple email/password login, backed by Supabase Auth. One admin user is
 * enough for v1, but nothing here assumes that - any user Supabase authenticates
 * is an admin, so adding a second is a matter of inviting them, with no code
 * change. If per-user roles are needed later, that check belongs here.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

/** Session-aware client, for use in Server Components and Server Actions. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies; middleware refreshes the
          // session instead, so this is safe to ignore.
        }
      },
    },
  });
}

export interface AdminUser {
  id: string;
  email: string;
}

/** Returns the signed-in admin, or null. Never throws. */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  } catch {
    return null;
  }
}

/**
 * Guard for every admin mutation. Server Actions are public HTTP endpoints, so
 * each one must check the session itself - the middleware redirect only
 * protects page navigation.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not signed in. Please sign in again and retry.");
  return user;
}
