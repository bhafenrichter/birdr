/**
 * Achievement definitions registry.
 *
 * Achievement IDs match those used in the confirm-sighting edge function.
 * Thresholds for family/habitat mastery are percentage-based and computed
 * against actual species counts at runtime — the registry stores the
 * display metadata only.
 */

import type { AchievementCategory } from "../types/api";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  /** For ordering within a category */
  sortOrder: number;
}

// ── Collection milestones (9) ─────────────────────────────────────────────

const COLLECTION: AchievementDefinition[] = [
  {
    id: "collection_1",
    name: "First Feather",
    description: "Identify your very first bird species.",
    category: "collection",
    sortOrder: 0,
  },
  {
    id: "collection_5",
    name: "Getting Started",
    description: "Collect 5 different species.",
    category: "collection",
    sortOrder: 1,
  },
  {
    id: "collection_10",
    name: "10 Species",
    description: "Collect 10 different species.",
    category: "collection",
    sortOrder: 2,
  },
  {
    id: "collection_25",
    name: "25 Species",
    description: "Collect 25 different species.",
    category: "collection",
    sortOrder: 3,
  },
  {
    id: "collection_50",
    name: "50 Species",
    description: "Collect 50 different species.",
    category: "collection",
    sortOrder: 4,
  },
  {
    id: "collection_100",
    name: "100 Species",
    description: "Build a collection of 100 different species.",
    category: "collection",
    sortOrder: 5,
  },
  {
    id: "collection_250",
    name: "250 Species",
    description: "Build a collection of 250 different species.",
    category: "collection",
    sortOrder: 6,
  },
  {
    id: "collection_500",
    name: "500 Species",
    description: "Build a collection of 500 different species.",
    category: "collection",
    sortOrder: 7,
  },
  {
    id: "collection_900",
    name: "All NA Species",
    description: "Collect every North American bird species. Legendary.",
    category: "collection",
    sortOrder: 8,
  },
];

// ── Streak tiers (6) ──────────────────────────────────────────────────────

const STREAKS: AchievementDefinition[] = [
  {
    id: "streak_3",
    name: "3-Day Streak",
    description: "Capture a bird 3 days in a row.",
    category: "streak",
    sortOrder: 0,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Capture a bird 7 days in a row.",
    category: "streak",
    sortOrder: 1,
  },
  {
    id: "streak_14",
    name: "14-Day Streak",
    description: "Keep your streak alive for two full weeks.",
    category: "streak",
    sortOrder: 2,
  },
  {
    id: "streak_30",
    name: "30-Day Streak",
    description: "A full month of daily captures.",
    category: "streak",
    sortOrder: 3,
  },
  {
    id: "streak_100",
    name: "100-Day Streak",
    description: "100 consecutive days. Dedication.",
    category: "streak",
    sortOrder: 4,
  },
  {
    id: "streak_365",
    name: "365-Day Streak",
    description: "A full year without missing a single day.",
    category: "streak",
    sortOrder: 5,
  },
];

// ── Family mastery (9 types × 5 tiers = 45) ──────────────────────────────

const FAMILY_TYPES = [
  { slug: "songbirds", name: "Songbirds" },
  { slug: "birds-of-prey", name: "Birds of Prey" },
  { slug: "waterfowl", name: "Waterfowl" },
  { slug: "wading-birds", name: "Wading Birds" },
  { slug: "shorebirds", name: "Shorebirds" },
  { slug: "seabirds", name: "Seabirds" },
  { slug: "game-birds", name: "Game Birds" },
  { slug: "woodpeckers", name: "Woodpeckers" },
  { slug: "aerial-specialists", name: "Aerial Specialists" },
];

const MASTERY_TIERS = [
  { tier: "spotter", label: "Spotter", pct: 5 },
  { tier: "apprentice", label: "Apprentice", pct: 10 },
  { tier: "adept", label: "Adept", pct: 25 },
  { tier: "expert", label: "Expert", pct: 50 },
  { tier: "master", label: "Master", pct: 100 },
];

const FAMILY: AchievementDefinition[] = FAMILY_TYPES.flatMap((type, typeIdx) =>
  MASTERY_TIERS.map((tier, tierIdx) => ({
    id: `family_${type.slug}_${tier.tier}`,
    name: `${type.name} ${tier.label}`,
    description: `Collect ${tier.pct}% of all ${type.name.toLowerCase()} species.`,
    category: "family" as const,
    sortOrder: typeIdx * 10 + tierIdx,
  }))
);

// ── Habitat mastery (9 habitats × 5 tiers = 45) ──────────────────────────

const HABITAT_TYPES = [
  { slug: "forests", name: "Forests" },
  { slug: "grasslands-farmland", name: "Grasslands & Farmland" },
  { slug: "deserts-scrublands", name: "Deserts & Scrublands" },
  { slug: "wetlands", name: "Wetlands" },
  { slug: "freshwater", name: "Freshwater" },
  { slug: "coasts-ocean", name: "Coasts & Ocean" },
  { slug: "mountains", name: "Mountains" },
  { slug: "tundra", name: "Tundra" },
  { slug: "cities-towns", name: "Cities & Towns" },
];

const HABITAT: AchievementDefinition[] = HABITAT_TYPES.flatMap(
  (habitat, habIdx) =>
    MASTERY_TIERS.map((tier, tierIdx) => ({
      id: `habitat_${habitat.slug}_${tier.tier}`,
      name: `${habitat.name} ${tier.label}`,
      description: `Collect ${tier.pct}% of all ${habitat.name.toLowerCase()} species.`,
      category: "habitat" as const,
      sortOrder: habIdx * 10 + tierIdx,
    }))
);

// ── Combined registry ─────────────────────────────────────────────────────

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...COLLECTION,
  ...STREAKS,
  ...FAMILY,
  ...HABITAT,
];

/** Lookup by achievement_id. */
export const ACHIEVEMENT_MAP: Record<string, AchievementDefinition> =
  Object.fromEntries(ALL_ACHIEVEMENTS.map((a) => [a.id, a]));

/** Get display info for an achievement ID. Returns fallback if unknown. */
export function getAchievement(id: string): AchievementDefinition {
  return (
    ACHIEVEMENT_MAP[id] ?? {
      id,
      name: id,
      description: "",
      category: "collection",
      sortOrder: 999,
    }
  );
}

/** Map DB category values to theme color keys. */
export const CATEGORY_COLOR_KEY: Record<string, string> = {
  collection: "collection",
  streak: "streaks",
  family: "familyMasters",
  habitat: "habitatMasters",
};

/** Category display labels. */
export const CATEGORY_LABELS: Record<string, string> = {
  collection: "Collection",
  streak: "Streaks",
  family: "Family Mastery",
  habitat: "Habitat Mastery",
};
