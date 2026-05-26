/**
 * confirm-sighting edge function
 *
 * Called after the user accepts a bird identification (auto or from top-3 picker).
 * Persists the sighting, updates streaks, evaluates achievements.
 *
 * Flow:
 * 1. Validate species_id exists in our DB
 * 2. Upload photo to storage (user/{user_id}/{uuid}.jpg)
 * 3. Insert sighting row
 * 4. Check if this is a First Sight (new card) or repeat sighting
 * 5. Update streak (lazy: compare last_capture_date to today)
 * 6. Evaluate scoped achievements (only categories that could change from this sighting)
 * 7. Return full state to client
 *
 * Request: POST JSON
 *   {
 *     species_id: uuid,
 *     photo_base64: string,
 *     photo_mime_type: string,
 *     lat?: number,
 *     lon?: number,
 *     named_location?: string
 *   }
 *
 * Response: JSON
 *   {
 *     sighting_id: uuid,
 *     is_first_sight: boolean,
 *     card: { species_id, common_name, sighting_count, ... },
 *     streak: { current_streak, longest_streak },
 *     achievements_unlocked: [{ achievement_id, category, name }]
 *   }
 */

import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser, createAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user } = await getAuthUser(req);
    // Use admin client for cross-table writes that bypass RLS
    const admin = createAdminClient();

    const body = await req.json();
    const { species_id, photo_base64, photo_mime_type, lat, lon, named_location } = body;

    if (!species_id || !photo_base64) {
      return new Response(
        JSON.stringify({ error: "species_id and photo_base64 are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validate species exists
    const { data: species, error: speciesError } = await admin
      .from("species")
      .select("id, common_name, scientific_name, conservation_status, species_type_id, primary_habitat_id")
      .eq("id", species_id)
      .single();

    if (speciesError || !species) {
      return new Response(
        JSON.stringify({ error: "Species not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Upload photo to storage
    const photoId = crypto.randomUUID();
    const ext = photo_mime_type === "image/png" ? "png" : "jpg";
    const photoPath = `${user.id}/${photoId}.${ext}`;

    const photoBytes = Uint8Array.from(atob(photo_base64), (c) => c.charCodeAt(0));

    const { error: uploadError } = await admin.storage
      .from("photos")
      .upload(photoPath, photoBytes, {
        contentType: photo_mime_type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: `Photo upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: photoUrlData } = admin.storage
      .from("photos")
      .getPublicUrl(photoPath);
    const photoUrl = photoUrlData.publicUrl;

    // 3. Check if this is a First Sight
    const { count: existingSightings } = await admin
      .from("sightings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("species_id", species_id);

    const isFirstSight = (existingSightings ?? 0) === 0;

    // 4. Insert sighting
    const { data: sighting, error: sightingError } = await admin
      .from("sightings")
      .insert({
        user_id: user.id,
        species_id,
        photo_url: photoUrl,
        captured_at: new Date().toISOString(),
        lat: lat ?? null,
        lon: lon ?? null,
        named_location: named_location ?? null,
      })
      .select("id, captured_at")
      .single();

    if (sightingError) {
      return new Response(
        JSON.stringify({ error: `Failed to save sighting: ${sightingError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Update streak
    const streak = await updateStreak(admin, user.id);

    // 6. Evaluate achievements (scoped to what could change from this sighting)
    const achievementsUnlocked = await evaluateAchievements(
      admin,
      user.id,
      species,
      isFirstSight,
      streak
    );

    // 7. Build card data from the cards view
    const { data: card } = await admin
      .from("sightings")
      .select("species_id")
      .eq("user_id", user.id)
      .eq("species_id", species_id);

    const sightingCount = card?.length ?? 1;

    return new Response(
      JSON.stringify({
        sighting_id: sighting.id,
        is_first_sight: isFirstSight,
        card: {
          species_id: species.id,
          common_name: species.common_name,
          scientific_name: species.scientific_name,
          conservation_status: species.conservation_status,
          sighting_count: sightingCount,
          hero_photo_url: isFirstSight ? photoUrl : undefined,
        },
        streak: {
          current_streak: streak.current_streak,
          longest_streak: streak.longest_streak,
        },
        achievements_unlocked: achievementsUnlocked,
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
 * Lazy streak update: compare last_capture_date to today.
 * - Same day: no change
 * - Yesterday: increment streak
 * - Older: reset to 1
 */
async function updateStreak(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { data: streak } = await admin
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) {
    throw new Error("Streak record not found");
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  if (streak.last_capture_date === todayStr) {
    // Already captured today, no streak change
    return streak;
  }

  let newStreak: number;

  if (streak.last_capture_date) {
    const lastDate = new Date(streak.last_capture_date);
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = streak.current_streak + 1;
    } else {
      // Gap — reset to 1
      newStreak = 1;
    }
  } else {
    // First ever capture
    newStreak = 1;
  }

  const newLongest = Math.max(streak.longest_streak, newStreak);

  const { data: updated } = await admin
    .from("streaks")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_capture_date: todayStr,
    })
    .eq("user_id", userId)
    .select()
    .single();

  return updated ?? { ...streak, current_streak: newStreak, longest_streak: newLongest };
}

/**
 * Evaluate achievements that could have been unlocked by this sighting.
 * Scoped evaluation: only checks categories relevant to the sighting.
 *
 * Categories:
 * - collection: total unique species milestones (1, 5, 10, 25, 50, 100, 250, 500, 900)
 * - streak: streak tier thresholds (3, 7, 14, 30, 100, 365)
 * - family: species_type mastery tiers (per type: 5%, 10%, 25%, 50%, 100%)
 * - habitat: habitat mastery tiers (per habitat: 5%, 10%, 25%, 50%, 100%)
 */
async function evaluateAchievements(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  species: { species_type_id: string; primary_habitat_id: string },
  isFirstSight: boolean,
  streak: { current_streak: number }
) {
  const unlocked: Array<{ achievement_id: string; category: string; name: string }> = [];

  // Only evaluate collection/family/habitat if this is a first sight (new card)
  if (isFirstSight) {
    // Collection milestones
    const collectionUnlocks = await evaluateCollectionMilestones(admin, userId);
    unlocked.push(...collectionUnlocks);

    // Family mastery
    const familyUnlocks = await evaluateFamilyMastery(admin, userId, species.species_type_id);
    unlocked.push(...familyUnlocks);

    // Habitat mastery
    const habitatUnlocks = await evaluateHabitatMastery(admin, userId, species.primary_habitat_id);
    unlocked.push(...habitatUnlocks);
  }

  // Streak achievements (always check after streak update)
  const streakUnlocks = await evaluateStreakTiers(admin, userId, streak.current_streak);
  unlocked.push(...streakUnlocks);

  return unlocked;
}

const COLLECTION_MILESTONES = [
  { count: 1, id: "collection_1", name: "One Small Peck for Man" },
  { count: 5, id: "collection_5", name: "Getting Your Wings" },
  { count: 10, id: "collection_10", name: "The Hen Commandments" },
  { count: 25, id: "collection_25", name: "The Great Gats-beak" },
  { count: 50, id: "collection_50", name: "Fifty Shades of Grey Heron" },
  { count: 100, id: "collection_100", name: "The Centurion Wing" },
  { count: 250, id: "collection_250", name: "To Kill a Lot of Mockingbirds" },
  { count: 500, id: "collection_500", name: "Five Hundred Days of Birdr" },
  { count: 900, id: "collection_900", name: "Lord of the Wings" },
];

async function evaluateCollectionMilestones(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  // Count unique species the user has spotted
  const { count } = await admin
    .from("sightings")
    .select("species_id", { count: "exact", head: true })
    // Use a raw query approach: count distinct species_id
    .eq("user_id", userId);

  // Get distinct species count via a different approach
  const { data: distinctSpecies } = await admin.rpc("count_user_species", {
    p_user_id: userId,
  }).single();

  // Fallback: count from sightings grouped
  let speciesCount: number;
  if (distinctSpecies?.count !== undefined) {
    speciesCount = distinctSpecies.count;
  } else {
    // Manual count via sightings
    const { data: sightings } = await admin
      .from("sightings")
      .select("species_id")
      .eq("user_id", userId);
    speciesCount = new Set(sightings?.map((s) => s.species_id) ?? []).size;
  }

  // Get existing achievements
  const { data: existing } = await admin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)
    .eq("category", "collection");

  const existingIds = new Set(existing?.map((a) => a.achievement_id) ?? []);

  const newUnlocks: Array<{ achievement_id: string; category: string; name: string }> = [];

  for (const milestone of COLLECTION_MILESTONES) {
    if (speciesCount >= milestone.count && !existingIds.has(milestone.id)) {
      await admin.from("user_achievements").insert({
        user_id: userId,
        achievement_id: milestone.id,
        category: "collection",
        progress: 1.0,
      });
      newUnlocks.push({
        achievement_id: milestone.id,
        category: "collection",
        name: milestone.name,
      });
    }
  }

  return newUnlocks;
}

const STREAK_TIERS = [
  { days: 3, id: "streak_3", name: "Beak-end at Bernie's" },
  { days: 7, id: "streak_7", name: "The Birdy Bunch" },
  { days: 14, id: "streak_14", name: "2 Beak Streak" },
  { days: 30, id: "streak_30", name: "Nest-flix and Chill" },
  { days: 100, id: "streak_100", name: "One Hundred Beaks of Solitude" },
  { days: 365, id: "streak_365", name: "Around the Birld in 365 Days" },
];

async function evaluateStreakTiers(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  currentStreak: number
) {
  const { data: existing } = await admin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)
    .eq("category", "streak");

  const existingIds = new Set(existing?.map((a) => a.achievement_id) ?? []);
  const newUnlocks: Array<{ achievement_id: string; category: string; name: string }> = [];

  for (const tier of STREAK_TIERS) {
    if (currentStreak >= tier.days && !existingIds.has(tier.id)) {
      await admin.from("user_achievements").insert({
        user_id: userId,
        achievement_id: tier.id,
        category: "streak",
        progress: 1.0,
      });
      newUnlocks.push({
        achievement_id: tier.id,
        category: "streak",
        name: tier.name,
      });
    }
  }

  return newUnlocks;
}

const MASTERY_TIERS: Array<{ pct: number; tier: string; label: string }> = [
  { pct: 0.05, tier: "spotter", label: "Bird Curious" },
  { pct: 0.10, tier: "apprentice", label: "Beak-ginner's Luck" },
  { pct: 0.25, tier: "adept", label: "Nest in Class" },
  { pct: 0.50, tier: "expert", label: "Glass Half Fowl" },
  { pct: 1.00, tier: "master", label: "The Godfeather" },
];

async function evaluateFamilyMastery(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  speciesTypeId: string
) {
  // Count total species in this type
  const { count: totalInType } = await admin
    .from("species")
    .select("id", { count: "exact", head: true })
    .eq("species_type_id", speciesTypeId);

  if (!totalInType) return [];

  // Count user's unique species in this type
  const { data: userSightings } = await admin
    .from("sightings")
    .select("species_id, species!inner(species_type_id)")
    .eq("user_id", userId)
    .eq("species.species_type_id", speciesTypeId);

  const userSpeciesCount = new Set(userSightings?.map((s) => s.species_id) ?? []).size;

  // Get species type name for achievement naming
  const { data: typeData } = await admin
    .from("species_types")
    .select("slug, name")
    .eq("id", speciesTypeId)
    .single();

  if (!typeData) return [];

  // Check existing achievements
  const { data: existing } = await admin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)
    .eq("category", "family");

  const existingIds = new Set(existing?.map((a) => a.achievement_id) ?? []);
  const newUnlocks: Array<{ achievement_id: string; category: string; name: string }> = [];

  for (const tier of MASTERY_TIERS) {
    const threshold = Math.ceil(totalInType * tier.pct);
    const achievementId = `family_${typeData.slug}_${tier.tier}`;

    if (userSpeciesCount >= threshold && !existingIds.has(achievementId)) {
      await admin.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievementId,
        category: "family",
        progress: userSpeciesCount / totalInType,
      });
      newUnlocks.push({
        achievement_id: achievementId,
        category: "family",
        name: `${typeData.name} ${tier.label}`,
      });
    }
  }

  return newUnlocks;
}

async function evaluateHabitatMastery(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  habitatId: string
) {
  // Count total species in this habitat
  const { count: totalInHabitat } = await admin
    .from("species")
    .select("id", { count: "exact", head: true })
    .eq("primary_habitat_id", habitatId);

  if (!totalInHabitat) return [];

  // Count user's unique species in this habitat
  const { data: userSightings } = await admin
    .from("sightings")
    .select("species_id, species!inner(primary_habitat_id)")
    .eq("user_id", userId)
    .eq("species.primary_habitat_id", habitatId);

  const userSpeciesCount = new Set(userSightings?.map((s) => s.species_id) ?? []).size;

  // Get habitat name
  const { data: habitatData } = await admin
    .from("habitats")
    .select("slug, name")
    .eq("id", habitatId)
    .single();

  if (!habitatData) return [];

  // Check existing achievements
  const { data: existing } = await admin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)
    .eq("category", "habitat");

  const existingIds = new Set(existing?.map((a) => a.achievement_id) ?? []);
  const newUnlocks: Array<{ achievement_id: string; category: string; name: string }> = [];

  for (const tier of MASTERY_TIERS) {
    const threshold = Math.ceil(totalInHabitat * tier.pct);
    const achievementId = `habitat_${habitatData.slug}_${tier.tier}`;

    if (userSpeciesCount >= threshold && !existingIds.has(achievementId)) {
      await admin.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievementId,
        category: "habitat",
        progress: userSpeciesCount / totalInHabitat,
      });
      newUnlocks.push({
        achievement_id: achievementId,
        category: "habitat",
        name: `${habitatData.name} ${tier.label}`,
      });
    }
  }

  return newUnlocks;
}
