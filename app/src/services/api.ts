/**
 * API service layer — typed wrappers around Supabase edge functions
 * and direct DB queries.
 */

import { supabase } from "./supabase";
import { logger } from "./logger";
import { getCached, setCache } from "./cache";
import type {
  IdentifyBirdResponse,
  ConfirmSightingRequest,
  ConfirmSightingResponse,
  ExploreSpeciesParams,
  ExploreSpeciesResponse,
  DeleteAccountResponse,
  Profile,
  Streak,
  Card,
  Sighting,
  UserAchievement,
  Species,
} from "../types/api";

// ── Helpers ────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function invokeFunction<T>(
  functionName: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown> | FormData;
    params?: Record<string, string | number | undefined>;
  } = {}
): Promise<T> {
  const { method = "POST", body, params } = options;

  let queryString = "";
  if (params) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined
    );
    if (filtered.length > 0) {
      queryString =
        "?" +
        filtered.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
    }
  }

  logger.info(`Invoking edge function: ${functionName}`, { method, params });

  const { data, error } = await supabase.functions.invoke<T>(
    `${functionName}${queryString}`,
    {
      method,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers:
        body instanceof FormData
          ? {} // Let the browser set Content-Type with boundary
          : { "Content-Type": "application/json" },
    }
  );

  if (error) {
    const status = (error as any).status ?? 500;
    const code = (error as any).code;
    logger.error(`Edge function ${functionName} failed`, { status, code, message: error.message });
    throw new ApiError(
      error.message ?? "Edge function error",
      status,
      code
    );
  }

  logger.info(`Edge function ${functionName} succeeded`);
  return data as T;
}

// ── Edge Function Calls ────────────────────────────────────────────────────

/**
 * Upload a photo for bird identification.
 * Returns candidates + confidence routing (auto_accepted / pick_top_3 / retry).
 */
export async function identifyBird(
  imageFile: { uri: string; type: string; name: string },
  location?: { lat: number; lon: number }
): Promise<IdentifyBirdResponse> {
  logger.info("Identifying bird", { hasLocation: !!location });
  const formData = new FormData();
  formData.append("image", imageFile as any);
  if (location) {
    formData.append("lat", String(location.lat));
    formData.append("lon", String(location.lon));
  }

  return invokeFunction<IdentifyBirdResponse>("identify-bird", {
    body: formData,
  });
}

/**
 * Confirm a species selection and persist the sighting.
 * Returns the card state, streak update, and any newly unlocked achievements.
 */
export async function confirmSighting(
  request: ConfirmSightingRequest
): Promise<ConfirmSightingResponse> {
  logger.info("Confirming sighting", { speciesId: (request as any).species_id });
  return invokeFunction<ConfirmSightingResponse>("confirm-sighting", {
    body: request as unknown as Record<string, unknown>,
  });
}

/**
 * Fetch species expected near the user's location.
 */
const EXPLORE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchExploreSpecies(
  params: ExploreSpeciesParams
): Promise<ExploreSpeciesResponse> {
  // Build a cache key from the params that affect the result
  const cacheKey = `explore:${params.lat.toFixed(1)}:${params.lon.toFixed(1)}:${params.mode ?? "near_me"}:${params.season_filter ?? ""}:${params.species_type_slug ?? ""}`;

  // Try cache first
  const cached = await getCached<ExploreSpeciesResponse>(cacheKey);
  if (cached) {
    logger.info("Explore cache hit", { cacheKey });
    return cached;
  }

  logger.info("Fetching explore species", { lat: params.lat, lon: params.lon, mode: params.mode });
  const result = await invokeFunction<ExploreSpeciesResponse>("explore-species", {
    method: "GET",
    params: {
      lat: params.lat,
      lon: params.lon,
      mode: params.mode,
      season_filter: params.season_filter,
      species_type_slug: params.species_type_slug,
      limit: params.limit,
      offset: params.offset,
    },
  });

  // Cache the result
  await setCache(cacheKey, result, EXPLORE_CACHE_TTL);

  return result;
}

/**
 * Permanently delete the current user's account and all data.
 */
export async function deleteAccount(): Promise<DeleteAccountResponse> {
  logger.warn("Deleting user account");
  return invokeFunction<DeleteAccountResponse>("delete-account");
}

// ── Direct DB Queries ──────────────────────────────────────────────────────

/** Fetch the current user's profile. */
export async function fetchProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    logger.error("Failed to fetch profile", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return data as Profile;
}

/** Fetch the current user's streak data. */
export async function fetchStreak(): Promise<Streak | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    logger.error("Failed to fetch streak", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return data as Streak;
}

/** Fetch the current user's cards (collection). */
export async function fetchCards(): Promise<Card[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", user.id)
    .order("last_seen_at", { ascending: false });

  if (error) {
    logger.error("Failed to fetch cards", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return (data ?? []) as Card[];
}

/** Fetch sightings for a specific species. */
export async function fetchSightingsForSpecies(
  speciesId: string
): Promise<Sighting[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .eq("user_id", user.id)
    .eq("species_id", speciesId)
    .order("captured_at", { ascending: false });

  if (error) {
    logger.error("Failed to fetch sightings for species", { speciesId, code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return (data ?? []) as Sighting[];
}

/** Fetch all achievements for the current user. */
export async function fetchAchievements(): Promise<UserAchievement[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false, nullsFirst: false });

  if (error) {
    logger.error("Failed to fetch achievements", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return (data ?? []) as UserAchievement[];
}

/** Fetch a single species by ID (with joined type and habitat names). */
export async function fetchSpecies(speciesId: string): Promise<
  Species & { species_type_name: string; habitat_name: string }
> {
  const { data, error } = await supabase
    .from("species")
    .select(
      `*, species_types!inner(name), habitats!inner(name)`
    )
    .eq("id", speciesId)
    .single();

  if (error) {
    logger.error("Failed to fetch species", { speciesId, code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }

  const row = data as any;
  return {
    ...row,
    species_type_name: row.species_types?.name ?? "",
    habitat_name: row.habitats?.name ?? "",
  };
}

/** Fetch all species (for collection All NA view). */
export async function fetchAllSpecies(): Promise<
  (Species & { species_type_name: string; habitat_name: string })[]
> {
  const { data, error } = await supabase
    .from("species")
    .select(
      `*, species_types!inner(name), habitats!inner(name)`
    )
    .order("common_name");

  if (error) {
    logger.error("Failed to fetch all species", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }

  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    species_type_name: row.species_types?.name ?? "",
    habitat_name: row.habitats?.name ?? "",
  }));
}

const ALL_SPECIES_PAGE_SIZE = 60;

export async function fetchAllSpeciesPaginated(
  page: number,
  search?: string
): Promise<{
  species: (Species & { species_type_name: string; habitat_name: string })[];
  hasMore: boolean;
}> {
  const from = page * ALL_SPECIES_PAGE_SIZE;
  const to = from + ALL_SPECIES_PAGE_SIZE - 1;

  let query = supabase
    .from("species")
    .select(`*, species_types!inner(name), habitats!inner(name)`, { count: "exact" })
    .order("common_name")
    .range(from, to);

  if (search) {
    query = query.ilike("common_name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error("Failed to fetch species page", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }

  const species = ((data ?? []) as any[]).map((row) => ({
    ...row,
    species_type_name: row.species_types?.name ?? "",
    habitat_name: row.habitats?.name ?? "",
  }));

  return { species, hasMore: (count ?? 0) > to + 1 };
}

/** Fetch recent sightings for capture hub (last N). */
export async function fetchRecentSightings(
  limit: number = 5
): Promise<(Sighting & { species: Species })[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sightings")
    .select("*, species!inner(*)")
    .eq("user_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Failed to fetch recent sightings", { code: error.code, message: error.message });
    throw new ApiError(error.message, 500, error.code);
  }
  return (data ?? []) as (Sighting & { species: Species })[];
}
