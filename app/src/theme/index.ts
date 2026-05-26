/**
 * birdr Design System — Vivid/Mint theme (v1 default)
 *
 * All color tokens, typography, spacing, and shadow presets.
 * Source of truth for the entire app's visual language.
 */

// ── Color tokens (Vivid/Mint) ──────────────────────────────────────────────

export const Colors = {
  // Primary brand
  sage: "#008D8F",
  sageLight: "#5DC79C",
  sageTint: "#D6EEEE",
  sageDeep: "#00595B",

  // Surfaces
  cream: "#EAF5E5",
  paper: "#DDEED7",
  cardBody: "#FBF9EF",

  // Ink / text
  ink: "#1B3937",
  inkSoft: "#4A6E6A",
  inkFaint: "#8AA4A0",

  // Accent warm
  saffron: "#FFB347",
  coral: "#E84B4B",

  // Accent cool
  sky: "#4FBDC0",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.5)",

  // Dark stage (card unlock reveal)
  stage: "#16181A",
} as const;

// Conservation tier colors — constant across all themes
export const ConservationTierColors = {
  LC: "#EFC027", // Least Concern — saffron gold
  NT: "#E89A3B", // Near Threatened — light orange
  VU: "#D85A30", // Vulnerable — coral
  EN: "#A53A1F", // Endangered — terracotta
  CR: "#6B1A12", // Critically Endangered — burgundy
} as const;

export type ConservationTier = keyof typeof ConservationTierColors;

// Rarity tier config
export const RarityConfig = {
  common: {
    label: "Common",
    badge: "C",
    borderColors: ["#f8e15c", "#edb915"],
    badgeColor: "#DAA520",
    shimmerIntensity: 0.3,
  },
  uncommon: {
    label: "Uncommon",
    badge: "UC",
    borderColors: ["#A8D8A8", "#4CAF50"],
    badgeColor: "#4CAF50",
    shimmerIntensity: 0.5,
  },
  rare: {
    label: "Rare",
    badge: "R",
    borderColors: ["#64B5F6", "#1565C0"],
    badgeColor: "#1565C0",
    shimmerIntensity: 0.7,
  },
  epic: {
    label: "Epic",
    badge: "EP",
    borderColors: ["#CE93D8", "#7B1FA2"],
    badgeColor: "#7B1FA2",
    shimmerIntensity: 0.85,
  },
  legendary: {
    label: "Legendary",
    badge: "LG",
    borderColors: ["#FFD54F", "#FF6F00"],
    badgeColor: "#FF6F00",
    shimmerIntensity: 1.0,
  },
} as const;

// Achievement category accent colors
export const AchievementColors = {
  collection: Colors.sage,
  streaks: Colors.coral,
  regional: Colors.sky,
  familyMasters: "#8B5CF6", // purple
  habitatMasters: "#14B8A6", // teal
} as const;

export type AchievementCategory = keyof typeof AchievementColors;

// ── Typography ─────────────────────────────────────────────────────────────

export const Fonts = {
  light: "PlusJakartaSans_300Light",
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 30,
  "3xl": 36,
} as const;

// ── Spacing ────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

// ── Border Radius ──────────────────────────────────────────────────────────

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
} as const;

// ── Shadows ────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ── Composite theme export ─────────────────────────────────────────────────

export const Theme = {
  Colors,
  ConservationTierColors,
  RarityConfig,
  AchievementColors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} as const;
