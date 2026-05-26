/**
 * identify-bird edge function
 *
 * Accepts a bird photo (multipart/form-data), checks the user's daily quota,
 * sends the image to the configured bird ID provider (GPT-4o by default),
 * and returns ranked species candidates with confidence scores.
 *
 * Confidence thresholds (per PRD §6.2):
 *   >= 0.85  → auto_accepted (single match)
 *   0.60-0.85 → pick_top_3 (user picks from top 3)
 *   < 0.60   → retry (ask user to retake photo)
 *
 * Request: POST multipart/form-data
 *   - image: file (JPEG/PNG/HEIC)
 *   - lat: number (optional)
 *   - lon: number (optional)
 *
 * Response: JSON
 *   {
 *     result: "auto_accepted" | "pick_top_3" | "retry",
 *     candidates: [{ common_name, scientific_name, confidence, species_id? }],
 *     captures_remaining: number
 *   }
 */

import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser, createUserClient } from "../_shared/supabase.ts";
import { createBirdIdProvider } from "../_shared/bird-id/provider-factory.ts";

const FREE_DAILY_LIMIT = 3;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate
    const { user, client } = await getAuthUser(req);

    // 2. Check daily quota
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("subscription_tier, daily_captures_used, daily_captures_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset daily counter if it's a new day (UTC)
    const resetAt = new Date(profile.daily_captures_reset_at);
    const now = new Date();
    const isNewDay =
      now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
      now.getUTCMonth() !== resetAt.getUTCMonth() ||
      now.getUTCDate() !== resetAt.getUTCDate();

    let capturesUsed = profile.daily_captures_used;
    if (isNewDay) {
      capturesUsed = 0;
      await client
        .from("profiles")
        .update({ daily_captures_used: 0, daily_captures_reset_at: now.toISOString() })
        .eq("id", user.id);
    }

    // Enforce quota for free users
    const isSubscribed = profile.subscription_tier !== "free";
    if (!isSubscribed && capturesUsed >= FREE_DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "daily_quota_exceeded",
          message: "You've used all 3 free captures for today. Upgrade to continue.",
          captures_remaining: 0,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse request body (JSON with base64 image, or multipart form data)
    let imageBytes: Uint8Array;
    let imageMimeType = "image/jpeg";
    let lat: number | undefined;
    let lon: number | undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // JSON body with base64-encoded image
      const body = await req.json();

      if (!body.image_base64) {
        return new Response(
          JSON.stringify({ error: "Missing image_base64 in request body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const binaryString = atob(body.image_base64);
      imageBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageBytes[i] = binaryString.charCodeAt(i);
      }
      imageMimeType = body.image_type || "image/jpeg";
      lat = body.lat ? parseFloat(body.lat) : undefined;
      lon = body.lon ? parseFloat(body.lon) : undefined;
    } else {
      // Multipart form data (legacy / web)
      const formData = await req.formData();
      const imageFile = formData.get("image");

      if (!imageFile || !(imageFile instanceof File)) {
        return new Response(
          JSON.stringify({ error: "Missing image file in form data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      imageBytes = new Uint8Array(await imageFile.arrayBuffer());
      imageMimeType = imageFile.type || "image/jpeg";
      lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : undefined;
      lon = formData.get("lon") ? parseFloat(formData.get("lon") as string) : undefined;
    }

    // Resolve lat/lon to US state code for provider context
    let stateCode: string | undefined;
    if (lat !== undefined && lon !== undefined) {
      stateCode = resolveStateCode(lat, lon);
    }

    // 4. Call bird ID provider
    const provider = createBirdIdProvider();
    const idResult = await provider.identify({
      imageBytes,
      mimeType: imageMimeType,
      lat,
      lon,
      stateCode,
    });

    // 5. Match candidates against our species DB
    const matchedCandidates = await matchSpecies(client, idResult.candidates);

    // 6. Increment daily capture count
    await client
      .from("profiles")
      .update({ daily_captures_used: capturesUsed + 1 })
      .eq("id", user.id);

    const capturesRemaining = isSubscribed
      ? -1 // unlimited
      : FREE_DAILY_LIMIT - (capturesUsed + 1);

    // 7. Determine result type based on confidence
    const topConfidence = matchedCandidates[0]?.confidence ?? 0;
    let result: "auto_accepted" | "pick_top_3" | "retry";

    if (topConfidence >= 0.85 && matchedCandidates.length > 0) {
      result = "auto_accepted";
    } else if (topConfidence >= 0.60 && matchedCandidates.length > 0) {
      result = "pick_top_3";
    } else {
      result = "retry";
    }

    return new Response(
      JSON.stringify({
        result,
        candidates: result === "auto_accepted"
          ? matchedCandidates.slice(0, 1)
          : matchedCandidates.slice(0, 3),
        captures_remaining: capturesRemaining,
        provider: idResult.provider,
      }),
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

/**
 * Match provider candidates against our species DB.
 * Tries scientific_name first, falls back to common_name (case-insensitive).
 * Returns candidates enriched with species_id if found.
 */
async function matchSpecies(
  client: ReturnType<typeof createUserClient>,
  candidates: Array<{ common_name: string; scientific_name: string; confidence: number }>
) {
  if (candidates.length === 0) return [];

  const scientificNames = candidates.map((c) => c.scientific_name);
  const commonNames = candidates.map((c) => c.common_name);

  const { data: byScientific } = await client
    .from("species")
    .select("id, common_name, scientific_name, distinguishing_feature, conservation_status")
    .in("scientific_name", scientificNames);

  const { data: byCommon } = await client
    .from("species")
    .select("id, common_name, scientific_name, distinguishing_feature, conservation_status")
    .in("common_name", commonNames);

  // Build lookup maps with lowercase keys
  const sciMap = new Map(
    (byScientific || []).map((s) => [s.scientific_name.toLowerCase(), s])
  );
  const commonMap = new Map(
    (byCommon || []).map((s) => [s.common_name.toLowerCase(), s])
  );

  console.log("[matchSpecies] sciMap hits:", sciMap.size, "commonMap hits:", commonMap.size);

  return candidates
    .map((c) => {
      // Try scientific name first, fall back to common name
      const match = sciMap.get(c.scientific_name.toLowerCase())
        ?? commonMap.get(c.common_name.toLowerCase());
      return {
        common_name: match?.common_name ?? c.common_name,
        scientific_name: match?.scientific_name ?? c.scientific_name,
        confidence: c.confidence,
        species_id: match?.id ?? null,
        distinguishing_feature: match?.distinguishing_feature ?? null,
        conservation_status: match?.conservation_status ?? null,
      };
    })
    .filter((c) => c.species_id !== null);
}

/**
 * Simple lat/lon to US state code resolver.
 * Uses bounding box approximations for the continental US states.
 * Good enough for providing location context to the ID provider.
 */
function resolveStateCode(lat: number, lon: number): string | undefined {
  // Simplified state resolution using rough centroids
  // In production, use a proper point-in-polygon library
  // For now, return undefined and let the provider use lat/lon directly
  // TODO(birdr): implement proper state resolution or use a geocoding API
  return undefined;
}
