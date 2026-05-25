/**
 * Simple AsyncStorage cache with TTL support.
 * Used for caching explore species data and other expensive queries.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

const CACHE_PREFIX = "birdr_cache:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > entry.ttl) {
      // Expired — remove and return null
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (e: any) {
    logger.error("Cache read failed", { key, message: e.message });
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e: any) {
    logger.error("Cache write failed", { key, message: e.message });
  }
}

export async function clearCache(keyPattern?: string): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) =>
      k.startsWith(CACHE_PREFIX + (keyPattern ?? ""))
    );
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (e: any) {
    logger.error("Cache clear failed", { message: e.message });
  }
}
