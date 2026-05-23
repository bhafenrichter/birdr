import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create a Supabase client authenticated as the requesting user.
 * Reads the JWT from the Authorization header.
 */
export function createUserClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
    }
  );
}

/**
 * Create a Supabase admin client (bypasses RLS).
 * Use only for operations that require service_role access.
 */
export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

/**
 * Extract and verify the user ID from the JWT.
 * Throws if the user is not authenticated.
 */
export async function getAuthUser(req: Request) {
  const client = createUserClient(req);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { user, client };
}
