/**
 * React hooks wrapping API service calls with loading/error state.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import * as api from "../services/api";
import { logger } from "../services/logger";
import { on, CAPTURE_COMPLETED } from "../services/events";
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

// ── Generic fetch hook ─────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      const msg = e.message ?? "Unknown error";
      logger.error("useQuery failed", { message: msg });
      setError(msg);
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
  const result = useQuery(() => api.fetchProfile());

  useEffect(() => {
    return on(CAPTURE_COMPLETED, result.refetch);
  }, [result.refetch]);

  // Refetch when app returns to foreground so quota display is fresh after a day change
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") result.refetch();
    });
    return () => sub.remove();
  }, [result.refetch]);

  return result;
}

export function useStreak(): UseQueryResult<Streak | null> {
  const result = useQuery(() => api.fetchStreak());

  useEffect(() => {
    return on(CAPTURE_COMPLETED, result.refetch);
  }, [result.refetch]);

  return result;
}

export function useCards(): UseQueryResult<Card[]> {
  const result = useQuery(() => api.fetchCards());

  // Auto-refetch when a new bird is captured
  useEffect(() => {
    return on(CAPTURE_COMPLETED, result.refetch);
  }, [result.refetch]);

  return result;
}

export function useSightingsForSpecies(
  speciesId: string
): UseQueryResult<Sighting[]> {
  return useQuery(
    () => api.fetchSightingsForSpecies(speciesId),
    [speciesId]
  );
}

export function useAchievements(): UseQueryResult<UserAchievement[]> {
  return useQuery(() => api.fetchAchievements());
}

export function useExploreSpecies(
  params: ExploreSpeciesParams | null
): UseQueryResult<ExploreSpeciesResponse | null> {
  const result = useQuery(
    () =>
      params
        ? api.fetchExploreSpecies(params)
        : Promise.resolve(null),
    [params?.lat, params?.lon, params?.mode]
  );

  // Auto-refetch when a new bird is captured (cache is already busted in confirmSighting)
  useEffect(() => {
    return on(CAPTURE_COMPLETED, result.refetch);
  }, [result.refetch]);

  return result;
}

export function useSpecies(speciesId: string): UseQueryResult<
  Species & { species_type_name: string; habitat_name: string }
> {
  return useQuery(() => api.fetchSpecies(speciesId), [speciesId]);
}

export function useSpeciesStates(speciesId: string): UseQueryResult<string[]> {
  return useQuery(() => api.fetchSpeciesStates(speciesId), [speciesId]);
}

export function useCaptureDates(): UseQueryResult<string[]> {
  return useQuery(() => api.fetchCaptureDates());
}

export function useMapSightings(): UseQueryResult<
  (Sighting & { species: Species })[]
> {
  return useQuery(() => api.fetchMapSightings());
}

export function useAllSpecies(): UseQueryResult<
  (Species & { species_type_name: string; habitat_name: string })[]
> {
  const result = useQuery(() => api.fetchAllSpecies());

  useEffect(() => {
    return on(CAPTURE_COMPLETED, result.refetch);
  }, [result.refetch]);

  return result;
}

type SpeciesWithJoins = Species & { species_type_name: string; habitat_name: string };

export function useAllSpeciesPaginated(search: string) {
  const [data, setData] = useState<SpeciesWithJoins[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const fetchPage = useCallback(async (page: number, query: string) => {
    try {
      const result = await api.fetchAllSpeciesPaginated(page, query || undefined);
      if (page === 0) {
        setData(result.species);
      } else {
        setData((prev) => [...prev, ...result.species]);
      }
      setHasMore(result.hasMore);
    } catch (e: any) {
      logger.error("useAllSpeciesPaginated failed", { message: e.message });
    }
  }, []);

  // Reset on search change
  useEffect(() => {
    pageRef.current = 0;
    setIsLoading(true);
    setHasMore(true);
    fetchPage(0, search).finally(() => setIsLoading(false));
  }, [search, fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchPage(nextPage, search).finally(() => setIsLoadingMore(false));
  }, [hasMore, isLoadingMore, search, fetchPage]);

  return { data, isLoading, isLoadingMore, hasMore, loadMore };
}
