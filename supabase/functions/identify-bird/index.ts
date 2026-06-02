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
import { getAuthUser, createUserClient, createAdminClient } from "../_shared/supabase.ts";
import { createBirdIdProvider } from "../_shared/bird-id/provider-factory.ts";
import { captureAiGeneration } from "../_shared/posthog.ts";

const FREE_DAILY_LIMIT = 3;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Try to authenticate — if it fails and we have no user, treat as test/service call
    let client: ReturnType<typeof createUserClient>;
    let isServiceRole = false;
    let isSubscribed = true;
    let capturesUsed = 0;
    let userId: string | null = null;

    try {
      console.log("[identify-bird] Step 1: Authenticating...");
      const auth = await getAuthUser(req);
      client = auth.client;
      const user = auth.user;
      userId = user.id;
      console.log("[identify-bird] Authenticated user:", user.id);

      console.log("[identify-bird] Step 2: Checking daily quota...");
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("subscription_tier, daily_captures_used, daily_captures_reset_at")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("[identify-bird] Profile not found", { profileError, userId: user.id });
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("[identify-bird] Profile loaded", { tier: profile.subscription_tier, used: profile.daily_captures_used });

      // Reset daily counter if it's a new day (UTC)
      const resetAt = new Date(profile.daily_captures_reset_at);
      const now = new Date();
      const isNewDay =
        now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
        now.getUTCMonth() !== resetAt.getUTCMonth() ||
        now.getUTCDate() !== resetAt.getUTCDate();

      capturesUsed = profile.daily_captures_used;
      if (isNewDay) {
        capturesUsed = 0;
        await client
          .from("profiles")
          .update({ daily_captures_used: 0, daily_captures_reset_at: now.toISOString() })
          .eq("id", user.id);
      }

      isSubscribed = profile.subscription_tier !== "free";
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
    } catch {
      console.log("[identify-bird] Auth failed — using service/test mode, skipping quota");
      isServiceRole = true;
      client = createAdminClient() as any;
    }

    console.log("[identify-bird] Step 3: Parsing request body...");
    const contentType = req.headers.get("content-type") || "";
    console.log("[identify-bird] Content-Type:", contentType);
    let imageBytes: Uint8Array;
    let imageMimeType = "image/jpeg";
    let lat: number | undefined;
    let lon: number | undefined;
    let forceLowDetail = false;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      console.log("[identify-bird] JSON body received", { hasImage: !!body.image_base64, imageLen: body.image_base64?.length, imageType: body.image_type, lat: body.lat, lon: body.lon });

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
      forceLowDetail = body.forceLowDetail === true;
    } else {
      console.log("[identify-bird] Multipart form data");
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

    console.log("[identify-bird] Image ready", { bytes: imageBytes.length, mime: imageMimeType, lat, lon });

    // Resolve lat/lon to US state code for provider context
    let stateCode: string | undefined;
    if (lat !== undefined && lon !== undefined) {
      stateCode = resolveStateCode(lat, lon);
    }

    console.log("[identify-bird] Step 4: Calling bird ID provider...");
    const provider = createBirdIdProvider();
    const detail = "low";
    console.log("[identify-bird] Image detail level:", detail);
    const idResult = await provider.identify({
      imageBytes,
      mimeType: imageMimeType,
      lat,
      lon,
      stateCode,
      detail,
    });

    console.log("[identify-bird] Step 5: Provider returned", {
      candidateCount: idResult.candidates.length,
      topCandidate: idResult.candidates[0]?.common_name,
      topConfidence: idResult.candidates[0]?.confidence,
      photo_quality: idResult.photo_quality,
      is_screen_photo: idResult.is_screen_photo,
      setting: idResult.setting,
    });

    // Fire-and-forget PostHog $ai_generation event
    if (userId) captureAiGeneration({
      distinctId: userId,
      traceId: crypto.randomUUID(),
      model: `gpt-4o`,
      provider: "openai",
      input: [
        { role: "system", content: "[bird identification prompt]" },
        { role: "user", content: [{ type: "image_url", image_url: { detail } }, { type: "text", text: "Identify the bird species in this photo." }] },
      ],
      outputChoices: [
        { role: "assistant", content: idResult.candidates.map((c) => `${c.common_name} (${c.confidence})`).join(", ") },
      ],
      inputTokens: idResult.usage?.inputTokens ?? 0,
      outputTokens: idResult.usage?.outputTokens ?? 0,
      latencySeconds: idResult.usage?.latencySeconds ?? 0,
      temperature: 0.2,
      maxTokens: 600,
      extraProperties: {
        bird_id_detail: detail,
        bird_id_result: idResult.candidates.length > 0 ? "success" : "no_candidates",
        bird_id_top_confidence: idResult.candidates[0]?.confidence ?? 0,
        bird_id_candidate_count: idResult.candidates.length,
        bird_id_photo_quality: idResult.photo_quality,
        bird_id_is_screen_photo: idResult.is_screen_photo,
        subscription_tier: isSubscribed ? "paid" : "free",
      },
    }).catch(() => {}); // swallow errors — don't block the response

    console.log("[identify-bird] Step 6: Matching candidates against species DB...");
    const matchedCandidates = await matchSpecies(client, idResult.candidates);

    console.log("[identify-bird] Matched candidates:", matchedCandidates.length, matchedCandidates.map(c => `${c.common_name} (${c.confidence})`));

    // 7. Increment daily capture count (skip for service role)
    let capturesRemaining = -1;
    if (!isServiceRole && userId) {
      await client
        .from("profiles")
        .update({ daily_captures_used: capturesUsed + 1 })
        .eq("id", userId);
      capturesRemaining = isSubscribed
        ? -1
        : FREE_DAILY_LIMIT - (capturesUsed + 1);
    }

    // 8. Check for species aliases — if any matched candidate has aliases, add them
    const matchedIds = matchedCandidates.map((c) => c.species_id).filter(Boolean);
    let hasAliases = false;
    if (matchedIds.length > 0) {
      const { data: aliases } = await client
        .from("species_aliases")
        .select("species_id, alias_species_id")
        .in("species_id", matchedIds);

      if (aliases && aliases.length > 0) {
        hasAliases = true;
        const aliasSpeciesIds = aliases.map((a) => a.alias_species_id);
        // Fetch the aliased species details
        const { data: aliasSpecies } = await client
          .from("species")
          .select("id, common_name, scientific_name, distinguishing_feature, conservation_status")
          .in("id", aliasSpeciesIds);

        if (aliasSpecies) {
          for (const sp of aliasSpecies) {
            // Don't add if already in candidates
            if (!matchedCandidates.find((c) => c.species_id === sp.id)) {
              matchedCandidates.push({
                common_name: sp.common_name,
                scientific_name: sp.scientific_name,
                confidence: matchedCandidates[0]?.confidence ?? 0.7,
                species_id: sp.id,
                distinguishing_feature: sp.distinguishing_feature,
                conservation_status: sp.conservation_status,
              });
            }
          }
        }
        console.log("[identify-bird] Aliases found, expanded candidates to:", matchedCandidates.length);
      }
    }

    // 9. Determine result type based on confidence, aliases, and photo quality
    const topConfidence = matchedCandidates[0]?.confidence ?? 0;
    let result: "auto_accepted" | "pick_top_3" | "retry";

    if (topConfidence >= 0.85 && matchedCandidates.length > 0) {
      // Force picker if aliases exist or photo quality is poor
      if (hasAliases || idResult.photo_quality === "poor") {
        result = "pick_top_3";
        console.log("[identify-bird] Forcing picker:", hasAliases ? "aliases found" : "poor photo quality");
      } else {
        result = "auto_accepted";
      }
    } else if (topConfidence >= 0.60 && matchedCandidates.length > 0) {
      result = "pick_top_3";
    } else {
      result = "retry";
    }

    console.log("[identify-bird] DONE", { result, topConfidence, capturesRemaining, matchedCount: matchedCandidates.length });

    return new Response(
      JSON.stringify({
        result,
        candidates: result === "auto_accepted"
          ? matchedCandidates.slice(0, 1)
          : matchedCandidates.slice(0, 3),
        captures_remaining: capturesRemaining,
        provider: idResult.provider,
        photo_quality: idResult.photo_quality,
        is_screen_photo: idResult.is_screen_photo,
        setting: idResult.setting,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const stack = err instanceof Error ? err.stack : undefined;
    const status = message === "Unauthorized" ? 401 : 500;
    console.error("[identify-bird] FAILED", { message, stack, status });

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
    .filter((c) => c.species_id !== null && c.conservation_status !== "EX");
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
