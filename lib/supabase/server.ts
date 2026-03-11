import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client (service role key).
 * NEVER expose to the browser.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, serviceRoleKey);
}
