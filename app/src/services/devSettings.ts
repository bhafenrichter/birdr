/**
 * Dev-only settings that persist via AsyncStorage.
 * These are only accessible in __DEV__ mode from the Profile screen.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_PREFIX = "birdr_dev:";

let _unlockAllCards = false;

export function isAllCardsUnlocked(): boolean {
  return __DEV__ && _unlockAllCards;
}

export async function setUnlockAllCards(value: boolean): Promise<void> {
  _unlockAllCards = value;
  await AsyncStorage.setItem(`${DEV_PREFIX}unlock_all_cards`, value ? "true" : "false");
}

export async function loadDevSettings(): Promise<void> {
  if (!__DEV__) return;
  const val = await AsyncStorage.getItem(`${DEV_PREFIX}unlock_all_cards`);
  _unlockAllCards = val === "true";
}
