import { getAdminUser } from "@/lib/admin/auth";
import { fail, ok } from "@/lib/api";
import { getServiceClient } from "@/lib/supabase";

/**
 * Image upload for the admin panel (SRS 9.1).
 *
 * The client never sees or types a URL - they pick a file, and this returns the
 * public URL the form stores behind the scenes.
 *
 * A route handler rather than a Server Action because file uploads stream more
 * predictably here, and it lets the browser show real upload progress.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return fail("Please sign in again.", 401);

  const supabase = getServiceClient();
  if (!supabase) return fail("The database isn't connected yet.", 503);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Could not read the upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("Please choose a file.");
  if (file.size === 0) return fail("That file is empty.");
  if (file.size > MAX_BYTES) {
    return fail("That image is larger than 8 MB. Please use a smaller version.");
  }
  if (!ALLOWED.has(file.type)) {
    return fail("Please upload a JPG, PNG, WebP, AVIF or GIF image.");
  }

  // Randomised name, so re-uploading never collides and never guesses at the
  // original filename's safety.
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const folder = String(form.get("folder") ?? "general").replace(/[^a-z0-9-]/gi, "") || "general";
  const path = `${folder}/${crypto.randomUUID()}.${extension || "jpg"}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    console.error("[upload] failed:", error.message);
    return fail("The upload failed. Please try again.", 502);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);

  return ok({ url: publicUrl });
}
