/**
 * Dev-only settings that persist via AsyncStorage.
 * These are only accessible in __DEV__ mode from the Profile screen.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_PREFIX = "birdr_dev:";

// ── Unlock all cards ──────────────────────────────────────────────────────

let _unlockAllCards = false;

export function isAllCardsUnlocked(): boolean {
  return __DEV__ && _unlockAllCards;
}

export async function setUnlockAllCards(value: boolean): Promise<void> {
  _unlockAllCards = value;
  await AsyncStorage.setItem(`${DEV_PREFIX}unlock_all_cards`, value ? "true" : "false");
}

// ── Capture override ──────────────────────────────────────────────────────
// "off" = normal flow, "first_sight" = skip API and show first sight,
// "repeat" = skip API and show repeat sighting

export type CaptureOverride = "off" | "first_sight" | "repeat";

let _captureOverride: CaptureOverride = "off";

export function getCaptureOverride(): CaptureOverride {
  return __DEV__ ? _captureOverride : "off";
}

export async function setCaptureOverride(value: CaptureOverride): Promise<void> {
  _captureOverride = value;
  await AsyncStorage.setItem(`${DEV_PREFIX}capture_override`, value);
}

// ── Load all settings ─────────────────────────────────────────────────────

export async function loadDevSettings(): Promise<void> {
  if (!__DEV__) return;
  const [unlockVal, captureVal] = await Promise.all([
    AsyncStorage.getItem(`${DEV_PREFIX}unlock_all_cards`),
    AsyncStorage.getItem(`${DEV_PREFIX}capture_override`),
  ]);
  _unlockAllCards = unlockVal === "true";
  _captureOverride = (captureVal as CaptureOverride) || "off";
}
