/**
 * delete-account edge function
 *
 * Permanently deletes a user's account and all associated data.
 * Requires SUPABASE_SERVICE_ROLE_KEY for auth.admin.deleteUser().
 *
 * Deletion order (respects FK constraints):
 * 1. Delete user photos from storage bucket
 * 2. Delete user_achievements
 * 3. Delete sightings
 * 4. Delete streaks
 * 5. Delete profiles
 * 6. Delete auth user via admin API
 *
 * Request: POST (no body needed — user ID from JWT)
 * Response: { success: true }
 */

import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser, createAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user } = await getAuthUser(req);
    const admin = createAdminClient();
    const userId = user.id;

    // 1. Delete user photos from storage
    const { data: photoFiles } = await admin.storage
      .from("photos")
      .list(userId);

    if (photoFiles && photoFiles.length > 0) {
      const filePaths = photoFiles.map((f) => `${userId}/${f.name}`);
      const { error: storageError } = await admin.storage
        .from("photos")
        .remove(filePaths);

      if (storageError) {
        console.error(`Storage cleanup warning: ${storageError.message}`);
        // Continue with deletion even if storage cleanup partially fails
      }
    }

    // 2. Delete user_achievements
    const { error: achievementsError } = await admin
      .from("user_achievements")
      .delete()
      .eq("user_id", userId);

    if (achievementsError) {
      throw new Error(`Failed to delete achievements: ${achievementsError.message}`);
    }

    // 3. Delete sightings
    const { error: sightingsError } = await admin
      .from("sightings")
      .delete()
      .eq("user_id", userId);

    if (sightingsError) {
      throw new Error(`Failed to delete sightings: ${sightingsError.message}`);
    }

    // 4. Delete streaks
    const { error: streaksError } = await admin
      .from("streaks")
      .delete()
      .eq("user_id", userId);

    if (streaksError) {
      throw new Error(`Failed to delete streaks: ${streaksError.message}`);
    }

    // 5. Delete profile
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // 6. Delete auth user via admin API
    const { error: authError } = await admin.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
