/**
 * PostHog server-side event capture for edge functions.
 * Uses the PostHog REST API (/capture) since we're in Deno.
 */

const POSTHOG_API_KEY = Deno.env.get("POSTHOG_API_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST") || "https://us.i.posthog.com";

interface AiGenerationEvent {
  distinctId: string;
  traceId: string;
  model: string;
  provider: string;
  input: Array<{ role: string; content: unknown }>;
  outputChoices: Array<{ role: string; content: unknown }>;
  inputTokens: number;
  outputTokens: number;
  latencySeconds: number;
  temperature?: number;
  maxTokens?: number;
  isError?: boolean;
  error?: string;
  httpStatus?: number;
  extraProperties?: Record<string, unknown>;
}

/**
 * Capture a $ai_generation event in PostHog.
 * Fire-and-forget — errors are logged but don't throw.
 */
export async function captureAiGeneration(event: AiGenerationEvent): Promise<void> {
  if (!POSTHOG_API_KEY) {
    console.warn("[posthog] POSTHOG_API_KEY not set, skipping $ai_generation capture");
    return;
  }

  const properties: Record<string, unknown> = {
    $ai_trace_id: event.traceId,
    $ai_model: event.model,
    $ai_provider: event.provider,
    $ai_input: event.input,
    $ai_output_choices: event.outputChoices,
    $ai_input_tokens: event.inputTokens,
    $ai_output_tokens: event.outputTokens,
    $ai_latency: event.latencySeconds,
    $ai_base_url: "https://api.openai.com/v1",
    ...event.extraProperties,
  };

  if (event.temperature !== undefined) properties.$ai_temperature = event.temperature;
  if (event.maxTokens !== undefined) properties.$ai_max_tokens = event.maxTokens;
  if (event.isError !== undefined) properties.$ai_is_error = event.isError;
  if (event.error !== undefined) properties.$ai_error = event.error;
  if (event.httpStatus !== undefined) properties.$ai_http_status = event.httpStatus;

  try {
    const resp = await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        event: "$ai_generation",
        distinct_id: event.distinctId,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!resp.ok) {
      console.error("[posthog] Failed to capture $ai_generation", resp.status, await resp.text());
    }
  } catch (err) {
    console.error("[posthog] Error capturing $ai_generation", err);
  }
}
