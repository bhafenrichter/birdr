import type { BirdIdProvider } from "./types.ts";
import { Gpt4oAdapter } from "./gpt4o-adapter.ts";

/**
 * Factory for creating bird ID provider instances.
 * Reads BIRD_ID_PROVIDER env var to select the adapter.
 * Default: gpt-4o
 *
 * To add a new provider:
 * 1. Create a new adapter implementing BirdIdProvider
 * 2. Add a case to the switch below
 * 3. Set BIRD_ID_PROVIDER env var to the new provider name
 */
export function createBirdIdProvider(): BirdIdProvider {
  const providerName = Deno.env.get("BIRD_ID_PROVIDER") || "gpt-4o";

  switch (providerName) {
    case "gpt-4o":
      return new Gpt4oAdapter();
    // Future providers:
    // case "gemini-flash":
    //   return new GeminiFlashAdapter();
    // case "merlin":
    //   return new MerlinAdapter();
    default:
      throw new Error(`Unknown bird ID provider: ${providerName}`);
  }
}
