/**
 * TypeScript types matching the Supabase backend schema and
 * edge function request/response contracts.
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type ConservationStatus = "LC" | "NT" | "VU" | "EN" | "CR";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type Season = "year_round" | "summer" | "winter" | "migratory" | "rare";
export type SubscriptionTier = "free" | "weekly" | "yearly";
export type AchievementCategory = "collection" | "streak" | "family" | "habitat";
export type PhotoQuality = "pristine" | "good" | "fair" | "poor";

// ── DB Row Types ───────────────────────────────────────────────────────────

export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  taxonomic_order: string;
  species_type_id: string;
  primary_habitat_id: string;
  conservation_status: ConservationStatus;
  size: string;
  about_text: string;
  distinguishing_feature: string;
  rarity: Rarity;
  created_at: string;
  updated_at: string;
}

export interface SpeciesType {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Habitat {
  id: string;
  name: string;
  slug: string;
  description: string;
  illustration_url: string | null;
}

export interface Profile {
  id: string;
  customer_id: string;
  display_name: string;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  daily_captures_used: number;
  daily_captures_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Sighting {
  id: string;
  user_id: string;
  species_id: string;
  photo_url: string;
  captured_at: string;
  lat: number | null;
  lon: number | null;
  named_location: string | null;
  display_location: string | null;
  setting: string | null;
  photo_quality: PhotoQuality | null;
  created_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_capture_date: string | null;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  category: AchievementCategory;
  unlocked_at: string | null;
  progress: number;
}

/** The `cards` DB view — per-user per-species aggregate */
export interface Card {
  user_id: string;
  species_id: string;
  first_seen_at: string;
  last_seen_at: string;
  sighting_count: number;
  hero_photo_url: string | null;
}

// ── Edge Function: identify-bird ───────────────────────────────────────────

export type IdentifyResult = "auto_accepted" | "pick_top_3" | "retry";

export interface IdentifyCandidate {
  common_name: string;
  scientific_name: string;
  confidence: number;
  species_id: string | null;
  distinguishing_feature: string | null;
  conservation_status: ConservationStatus | null;
}

export interface IdentifyBirdResponse {
  result: IdentifyResult;
  candidates: IdentifyCandidate[];
  captures_remaining: number;
  provider: string;
  photo_quality: PhotoQuality;
  is_screen_photo: boolean;
  setting: string | null;
}

// ── Edge Function: confirm-sighting ────────────────────────────────────────

export interface ConfirmSightingRequest {
  species_id: string;
  photo_base64: string;
  photo_mime_type?: string;
  lat?: number;
  lon?: number;
  named_location?: string;
  setting?: string;
  photo_quality?: PhotoQuality;
}

export interface ConfirmSightingResponse {
  sighting_id: string;
  is_first_sight: boolean;
  card: {
    species_id: string;
    common_name: string;
    scientific_name: string;
    conservation_status: ConservationStatus;
    sighting_count: number;
    hero_photo_url?: string;
  };
  streak: {
    current_streak: number;
    longest_streak: number;
    streak_extended: boolean;
  };
  achievements_unlocked: {
    achievement_id: string;
    category: AchievementCategory;
    name: string;
  }[];
}

// ── Edge Function: explore-species ─────────────────────────────────────────

export type ExploreMode = "near_me" | "region";
export type SeasonFilter = "current" | "all";

export interface ExploreSpeciesParams {
  lat: number;
  lon: number;
  mode?: ExploreMode;
  season_filter?: SeasonFilter;
  species_type_slug?: string;
  limit?: number;
  offset?: number;
}

export interface ExploreSpeciesItem {
  species_id: string;
  common_name: string;
  scientific_name: string;
  species_type: string;
  habitat: string;
  conservation_status: ConservationStatus;
  distinguishing_feature: string;
  rarity: Rarity;
  season: Season;
  peak_frequency: number;
  spotted: boolean;
  sighting_count: number;
}

export interface ExploreSpeciesResponse {
  header: {
    season: string;
    location_name: string;
    state_code: string;
    total_species: number;
    spotted_count: number;
  };
  species: ExploreSpeciesItem[];
}

// ── Edge Function: delete-account ──────────────────────────────────────────

export interface DeleteAccountResponse {
  success: boolean;
}
