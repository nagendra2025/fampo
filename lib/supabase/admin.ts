import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with service role key.
 * This bypasses RLS and should only be used server-side for admin operations.
 * 
 * IMPORTANT: Never expose the service role key to the client!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please set it in your .env.local file and Vercel environment variables."
    );
  }

  if (!supabaseServiceRoleKey) {
    console.error("⚠️  SUPABASE_SERVICE_ROLE_KEY is not set!");
    console.error("This is required for photo uploads during signup.");
    console.error("Get it from: Supabase Dashboard → Settings → API → service_role key");
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "Please set it in your .env.local file and Vercel environment variables. " +
      "Get it from: Supabase Dashboard → Settings → API → service_role key"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

