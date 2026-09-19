import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/admin/auth";

/** Ends the admin session and returns to the login screen. */
export async function POST(request: Request) {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Signing out is best-effort; the redirect happens either way.
  }
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}
