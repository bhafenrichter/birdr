import type { ConservationTier } from "../theme";

// ── Species ────────────────────────────────────────────────────────────────

export type SpeciesType =
  | "Songbird"
  | "Raptor"
  | "Waterfowl"
  | "Shorebird"
  | "Woodpecker"
  | "Hummingbird"
  | "Wading bird";

export type Habitat =
  | "Forest"
  | "Grassland"
  | "Desert"
  | "Wetland"
  | "Freshwater"
  | "Coast"
  | "Mountain"
  | "Tundra"
  | "Urban";

export interface Species {
  id: string;
  name: string;
  familyName: string;
  speciesType: SpeciesType;
  habitat: Habitat;
  conservationTier: ConservationTier;
  size: string;
  about: string;
  distinguishingFeature: string;
}

export const DUMMY_SPECIES: Species[] = [
  {
    id: "sp-001",
    name: "Northern Cardinal",
    familyName: "Cardinalidae",
    speciesType: "Songbird",
    habitat: "Forest",
    conservationTier: "LC",
    size: "21–23 cm",
    about:
      "Brilliant red songbird with a distinctive crest and black face mask. One of the most recognizable backyard birds in eastern North America.",
    distinguishingFeature: "Bright red, black face mask",
  },
  {
    id: "sp-002",
    name: "Blue Jay",
    familyName: "Corvidae",
    speciesType: "Songbird",
    habitat: "Forest",
    conservationTier: "LC",
    size: "25–30 cm",
    about:
      "Intelligent and noisy corvid with striking blue, white, and black plumage. Known for mimicking hawk calls and caching acorns.",
    distinguishingFeature: "Blue crest, white wingbars",
  },
  {
    id: "sp-003",
    name: "Bald Eagle",
    familyName: "Accipitridae",
    speciesType: "Raptor",
    habitat: "Freshwater",
    conservationTier: "LC",
    size: "70–102 cm",
    about:
      "Iconic raptor and national bird of the United States. Once endangered, it has made a remarkable recovery thanks to conservation efforts.",
    distinguishingFeature: "White head, dark brown body",
  },
  {
    id: "sp-004",
    name: "Ruby-throated Hummingbird",
    familyName: "Trochilidae",
    speciesType: "Hummingbird",
    habitat: "Forest",
    conservationTier: "LC",
    size: "7–9 cm",
    about:
      "Tiny, jewel-toned hummingbird and the only breeding hummingbird in eastern North America. Beats its wings 53 times per second.",
    distinguishingFeature: "Iridescent ruby gorget",
  },
  {
    id: "sp-005",
    name: "American Robin",
    familyName: "Turdidae",
    speciesType: "Songbird",
    habitat: "Urban",
    conservationTier: "LC",
    size: "23–28 cm",
    about:
      "Familiar thrush often seen pulling earthworms from lawns. A harbinger of spring across much of North America.",
    distinguishingFeature: "Orange-red breast",
  },
  {
    id: "sp-006",
    name: "Red-tailed Hawk",
    familyName: "Accipitridae",
    speciesType: "Raptor",
    habitat: "Grassland",
    conservationTier: "LC",
    size: "45–65 cm",
    about:
      "The most common hawk in North America, often seen soaring over open country or perched on roadside poles.",
    distinguishingFeature: "Brick-red tail",
  },
  {
    id: "sp-007",
    name: "Great Blue Heron",
    familyName: "Ardeidae",
    speciesType: "Wading bird",
    habitat: "Wetland",
    conservationTier: "LC",
    size: "97–137 cm",
    about:
      "North America's largest heron, standing motionless at the water's edge before striking fish with lightning speed.",
    distinguishingFeature: "Tall, blue-gray, S-curved neck",
  },
  {
    id: "sp-008",
    name: "Piping Plover",
    familyName: "Charadriidae",
    speciesType: "Shorebird",
    habitat: "Coast",
    conservationTier: "NT",
    size: "15–19 cm",
    about:
      "Small, sand-colored shorebird that nests on open beaches. Populations have declined due to habitat disturbance.",
    distinguishingFeature: "Sandy, single black breast band",
  },
  {
    id: "sp-009",
    name: "California Condor",
    familyName: "Cathartidae",
    speciesType: "Raptor",
    habitat: "Mountain",
    conservationTier: "CR",
    size: "109–140 cm",
    about:
      "North America's largest flying bird, brought back from the brink of extinction through captive breeding programs.",
    distinguishingFeature: "Massive wingspan, bald head",
  },
  {
    id: "sp-010",
    name: "Florida Scrub-Jay",
    familyName: "Corvidae",
    speciesType: "Songbird",
    habitat: "Desert",
    conservationTier: "VU",
    size: "23–28 cm",
    about:
      "The only bird species found exclusively in Florida. Lives in scrubby flatwoods and is known for its cooperative breeding.",
    distinguishingFeature: "Blue head, no crest",
  },
  {
    id: "sp-011",
    name: "Whooping Crane",
    familyName: "Gruidae",
    speciesType: "Wading bird",
    habitat: "Wetland",
    conservationTier: "EN",
    size: "132–152 cm",
    about:
      "North America's tallest bird and one of the rarest. Intense conservation efforts have slowly increased wild populations.",
    distinguishingFeature: "All white, red crown, tall",
  },
  {
    id: "sp-012",
    name: "Pileated Woodpecker",
    familyName: "Picidae",
    speciesType: "Woodpecker",
    habitat: "Forest",
    conservationTier: "LC",
    size: "40–49 cm",
    about:
      "Crow-sized woodpecker with a flaming-red crest. Creates large rectangular holes in dead trees while foraging for carpenter ants.",
    distinguishingFeature: "Large, red crest, black body",
  },
];

// ── Sightings ──────────────────────────────────────────────────────────────

export interface Sighting {
  id: string;
  speciesId: string;
  photoUri: string | null;
  capturedAt: string; // ISO date
  lat: number;
  lon: number;
  namedLocation: string;
}

export const DUMMY_SIGHTINGS: Sighting[] = [
  {
    id: "si-001",
    speciesId: "sp-001",
    photoUri: null,
    capturedAt: "2026-05-22T14:30:00Z",
    lat: 35.5951,
    lon: -82.5515,
    namedLocation: "Asheville, NC",
  },
  {
    id: "si-002",
    speciesId: "sp-001",
    photoUri: null,
    capturedAt: "2026-05-20T09:15:00Z",
    lat: 35.5951,
    lon: -82.5515,
    namedLocation: "Asheville, NC",
  },
  {
    id: "si-003",
    speciesId: "sp-002",
    photoUri: null,
    capturedAt: "2026-05-21T11:00:00Z",
    lat: 35.6009,
    lon: -82.554,
    namedLocation: "Asheville, NC",
  },
  {
    id: "si-004",
    speciesId: "sp-005",
    photoUri: null,
    capturedAt: "2026-05-19T07:45:00Z",
    lat: 35.5951,
    lon: -82.5515,
    namedLocation: "Asheville, NC",
  },
  {
    id: "si-005",
    speciesId: "sp-007",
    photoUri: null,
    capturedAt: "2026-05-18T16:20:00Z",
    lat: 35.5175,
    lon: -82.5271,
    namedLocation: "Biltmore Estate, NC",
  },
  {
    id: "si-006",
    speciesId: "sp-006",
    photoUri: null,
    capturedAt: "2026-05-17T12:10:00Z",
    lat: 35.439,
    lon: -82.5417,
    namedLocation: "Hendersonville, NC",
  },
  {
    id: "si-007",
    speciesId: "sp-004",
    photoUri: null,
    capturedAt: "2026-05-16T08:00:00Z",
    lat: 35.5951,
    lon: -82.5515,
    namedLocation: "Asheville, NC",
  },
  {
    id: "si-008",
    speciesId: "sp-012",
    photoUri: null,
    capturedAt: "2026-05-15T10:30:00Z",
    lat: 35.7596,
    lon: -82.2654,
    namedLocation: "Blue Ridge Parkway, NC",
  },
];

// ── Cards (derived from sightings) ─────────────────────────────────────────

export interface UserCard {
  speciesId: string;
  species: Species;
  firstSeenAt: string;
  lastSeenAt: string;
  sightingCount: number;
  heroPhotoUri: string | null;
}

export function buildUserCards(): UserCard[] {
  const cardMap = new Map<string, UserCard>();

  for (const sighting of DUMMY_SIGHTINGS) {
    const species = DUMMY_SPECIES.find((s) => s.id === sighting.speciesId);
    if (!species) continue;

    const existing = cardMap.get(sighting.speciesId);
    if (existing) {
      existing.sightingCount += 1;
      if (sighting.capturedAt < existing.firstSeenAt)
        existing.firstSeenAt = sighting.capturedAt;
      if (sighting.capturedAt > existing.lastSeenAt)
        existing.lastSeenAt = sighting.capturedAt;
    } else {
      cardMap.set(sighting.speciesId, {
        speciesId: sighting.speciesId,
        species,
        firstSeenAt: sighting.capturedAt,
        lastSeenAt: sighting.capturedAt,
        sightingCount: 1,
        heroPhotoUri: sighting.photoUri,
      });
    }
  }

  return Array.from(cardMap.values()).sort(
    (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
  );
}

export const DUMMY_USER_CARDS = buildUserCards();

// ── Streak ─────────────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  captureDaysTotal: number;
  lastCaptureDate: string;
  hasCapturedToday: boolean;
  // Past 28 days: array of ISO date strings where capture happened
  capturedDays: string[];
}

export const DUMMY_STREAK: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  captureDaysTotal: 23,
  lastCaptureDate: "2026-05-22",
  hasCapturedToday: false,
  capturedDays: [
    "2026-05-22",
    "2026-05-21",
    "2026-05-20",
    "2026-05-19",
    "2026-05-18",
    "2026-05-17",
    "2026-05-16",
    "2026-05-13",
    "2026-05-12",
    "2026-05-10",
    "2026-05-08",
    "2026-05-05",
    "2026-05-02",
    "2026-04-30",
    "2026-04-28",
  ],
};

// ── Achievements ───────────────────────────────────────────────────────────

export type AchievementCategory =
  | "collection"
  | "streaks"
  | "familyMasters"
  | "habitatMasters";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  progress: number; // 0–1
  unlockedAt: string | null;
  target: number;
  current: number;
}

export const DUMMY_ACHIEVEMENTS: Achievement[] = [
  // Collection
  {
    id: "ach-c01",
    name: "First Feather",
    description: "Capture your first bird",
    category: "collection",
    progress: 1,
    unlockedAt: "2026-05-15",
    target: 1,
    current: 1,
  },
  {
    id: "ach-c02",
    name: "Budding Birder",
    description: "Capture 5 different species",
    category: "collection",
    progress: 1,
    unlockedAt: "2026-05-19",
    target: 5,
    current: 5,
  },
  {
    id: "ach-c03",
    name: "Growing Flock",
    description: "Capture 10 different species",
    category: "collection",
    progress: 0.7,
    unlockedAt: null,
    target: 10,
    current: 7,
  },
  {
    id: "ach-c04",
    name: "Avid Collector",
    description: "Capture 25 different species",
    category: "collection",
    progress: 0.28,
    unlockedAt: null,
    target: 25,
    current: 7,
  },
  {
    id: "ach-c05",
    name: "Century Club",
    description: "Capture 100 different species",
    category: "collection",
    progress: 0.07,
    unlockedAt: null,
    target: 100,
    current: 7,
  },

  // Streaks
  {
    id: "ach-s01",
    name: "Getting Started",
    description: "Capture on 3 consecutive days",
    category: "streaks",
    progress: 1,
    unlockedAt: "2026-05-18",
    target: 3,
    current: 3,
  },
  {
    id: "ach-s02",
    name: "Weekly Watcher",
    description: "Capture on 7 consecutive days",
    category: "streaks",
    progress: 1,
    unlockedAt: "2026-05-22",
    target: 7,
    current: 7,
  },
  {
    id: "ach-s03",
    name: "Fortnight Flyer",
    description: "Capture on 14 consecutive days",
    category: "streaks",
    progress: 0.5,
    unlockedAt: null,
    target: 14,
    current: 7,
  },
  {
    id: "ach-s04",
    name: "Monthly Devotee",
    description: "Capture on 30 consecutive days",
    category: "streaks",
    progress: 0.23,
    unlockedAt: null,
    target: 30,
    current: 7,
  },

  // Family Masters
  {
    id: "ach-f01",
    name: "Corvid Spotter",
    description: "Spot 5% of Corvidae family",
    category: "familyMasters",
    progress: 0.6,
    unlockedAt: null,
    target: 2,
    current: 1,
  },
  {
    id: "ach-f02",
    name: "Raptor Spotter",
    description: "Spot 5% of Accipitridae family",
    category: "familyMasters",
    progress: 0.4,
    unlockedAt: null,
    target: 3,
    current: 1,
  },

  // Habitat Masters
  {
    id: "ach-h01",
    name: "Forest Spotter",
    description: "Spot 5% of forest species",
    category: "habitatMasters",
    progress: 0.5,
    unlockedAt: null,
    target: 5,
    current: 3,
  },
  {
    id: "ach-h02",
    name: "Urban Spotter",
    description: "Spot 5% of urban species",
    category: "habitatMasters",
    progress: 0.2,
    unlockedAt: null,
    target: 2,
    current: 1,
  },
];

// ── Explore: species expected near user ────────────────────────────────────

export interface ExploreSpecies {
  species: Species;
  seasonality: "Year-round" | "Summer" | "Winter" | "Migration";
  spotted: boolean;
}

export function buildExploreList(): ExploreSpecies[] {
  const spottedIds = new Set(DUMMY_SIGHTINGS.map((s) => s.speciesId));

  return DUMMY_SPECIES.map((species) => ({
    species,
    seasonality: (["Year-round", "Summer", "Winter", "Migration"] as const)[
      Math.floor(Math.abs(hashString(species.id)) % 4)
    ],
    spotted: spottedIds.has(species.id),
  })).sort((a, b) => {
    // Unspotted first
    if (a.spotted !== b.spotted) return a.spotted ? 1 : -1;
    return a.species.name.localeCompare(b.species.name);
  });
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const DUMMY_EXPLORE_LIST = buildExploreList();

// ── User profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string;
  initial: string;
  totalCaptures: number;
  totalSpecies: number;
  currentStreak: number;
  isSubscribed: boolean;
  memberSince: string;
}

export const DUMMY_USER: UserProfile = {
  displayName: "Brandon",
  initial: "B",
  totalCaptures: DUMMY_SIGHTINGS.length,
  totalSpecies: DUMMY_USER_CARDS.length,
  currentStreak: DUMMY_STREAK.currentStreak,
  isSubscribed: false,
  memberSince: "2026-05-01",
};
