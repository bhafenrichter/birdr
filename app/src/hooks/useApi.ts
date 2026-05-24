/**
 * React hooks wrapping API service calls with loading/error state.
 * Falls back to dummy data when the Supabase URL isn't configured yet
 * (detected by the placeholder "YOUR_PROJECT" in the URL).
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";
import * as dummy from "../data/dummy";
import { supabase } from "../services/supabase";
import type {
  Card,
  Streak,
  Profile,
  UserAchievement,
  Sighting,
  Species,
  ExploreSpeciesParams,
  ExploreSpeciesResponse,
} from "../types/api";

// Check if Supabase is configured (not still placeholder)
function isSupabaseConfigured(): boolean {
  // @ts-ignore — accessing private _supabaseUrl
  const url: string = (supabase as any).supabaseUrl ?? "";
  return !url.includes("YOUR_PROJECT");
}

// ── Generic fetch hook ─────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useQuery<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      // Use dummy data during development
      setData(fallback);
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
      setData(fallback); // Degrade to dummy data on error
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

// ── Typed hooks ────────────────────────────────────────────────────────────

export function useProfile(): UseQueryResult<Profile | null> {
  const fallbackProfile: Profile = {
    id: "dummy",
    display_name: dummy.DUMMY_USER.displayName,
    avatar_url: null,
    subscription_tier: dummy.DUMMY_USER.isSubscribed ? "yearly" : "free",
    daily_captures_used: 1,
    daily_captures_reset_at: new Date().toISOString(),
    created_at: dummy.DUMMY_USER.memberSince,
    updated_at: new Date().toISOString(),
  };

  return useQuery(() => api.fetchProfile(), fallbackProfile);
}

export function useStreak(): UseQueryResult<Streak | null> {
  const fallbackStreak: Streak = {
    user_id: "dummy",
    current_streak: dummy.DUMMY_STREAK.currentStreak,
    longest_streak: dummy.DUMMY_STREAK.longestStreak,
    last_capture_date: dummy.DUMMY_STREAK.lastCaptureDate,
    updated_at: new Date().toISOString(),
  };

  return useQuery(() => api.fetchStreak(), fallbackStreak);
}

export function useCards(): UseQueryResult<Card[]> {
  const fallbackCards: Card[] = dummy.DUMMY_USER_CARDS.map((c) => ({
    user_id: "dummy",
    species_id: c.speciesId,
    first_seen_at: c.firstSeenAt,
    last_seen_at: c.lastSeenAt,
    sighting_count: c.sightingCount,
    hero_photo_url: c.heroPhotoUri,
  }));

  return useQuery(() => api.fetchCards(), fallbackCards);
}

export function useSightingsForSpecies(
  speciesId: string
): UseQueryResult<Sighting[]> {
  const fallbackSightings: Sighting[] = dummy.DUMMY_SIGHTINGS.filter(
    (s) => s.speciesId === speciesId
  ).map((s) => ({
    id: s.id,
    user_id: "dummy",
    species_id: s.speciesId,
    photo_url: s.photoUri ?? "",
    captured_at: s.capturedAt,
    lat: s.lat,
    lon: s.lon,
    named_location: s.namedLocation,
    display_location: null,
    created_at: s.capturedAt,
  }));

  return useQuery(
    () => api.fetchSightingsForSpecies(speciesId),
    fallbackSightings,
    [speciesId]
  );
}

export function useAchievements(): UseQueryResult<UserAchievement[]> {
  const fallbackAchievements: UserAchievement[] =
    dummy.DUMMY_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      user_id: "dummy",
      achievement_id: a.id,
      category: a.category as UserAchievement["category"],
      unlocked_at: a.unlockedAt,
      progress: a.progress,
    }));

  return useQuery(() => api.fetchAchievements(), fallbackAchievements);
}

export function useExploreSpecies(
  params: ExploreSpeciesParams | null
): UseQueryResult<ExploreSpeciesResponse | null> {
  const fallbackResponse: ExploreSpeciesResponse = {
    header: {
      season: "Spring",
      location_name: "Asheville, NC",
      state_code: "US-NC",
      total_species: dummy.DUMMY_EXPLORE_LIST.length,
      spotted_count: dummy.DUMMY_EXPLORE_LIST.filter((e) => e.spotted).length,
    },
    species: dummy.DUMMY_EXPLORE_LIST.map((e) => ({
      species_id: e.species.id,
      common_name: e.species.name,
      scientific_name: "",
      species_type: e.species.speciesType,
      habitat: e.species.habitat,
      conservation_status: e.species.conservationTier,
      distinguishing_feature: e.species.distinguishingFeature,
      season: "year_round" as const,
      peak_frequency: 0.5,
      spotted: e.spotted,
      sighting_count: e.spotted ? 1 : 0,
    })),
  };

  return useQuery(
    () =>
      params
        ? api.fetchExploreSpecies(params)
        : Promise.resolve(fallbackResponse),
    fallbackResponse,
    [params?.lat, params?.lon, params?.mode]
  );
}

export function useAllSpecies(): UseQueryResult<
  (Species & { species_type_name: string; habitat_name: string })[]
> {
  const fallback = dummy.DUMMY_SPECIES.map((s) => ({
    id: s.id,
    common_name: s.name,
    scientific_name: "",
    family: s.familyName,
    taxonomic_order: "",
    species_type_id: "",
    primary_habitat_id: "",
    conservation_status: s.conservationTier,
    size: s.size,
    about_text: s.about,
    distinguishing_feature: s.distinguishingFeature,
    created_at: "",
    updated_at: "",
    species_type_name: s.speciesType,
    habitat_name: s.habitat,
  }));

  return useQuery(() => api.fetchAllSpecies(), fallback);
}
