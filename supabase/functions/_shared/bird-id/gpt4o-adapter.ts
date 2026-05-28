import type {
  BirdIdProvider,
  BirdIdRequest,
  BirdIdResponse,
} from "./types.ts";

/**
 * GPT-4o bird identification adapter.
 * Sends the photo + location context to GPT-4o vision and parses
 * structured species candidates from the response.
 */
export class Gpt4oAdapter implements BirdIdProvider {
  private apiKey: string;

  constructor() {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    this.apiKey = key;
  }

  async identify(request: BirdIdRequest): Promise<BirdIdResponse> {
    console.log("[gpt4o] Starting identification", { imageSize: request.imageBytes.length, mime: request.mimeType, lat: request.lat, lon: request.lon, stateCode: request.stateCode });

    console.log("[gpt4o] Converting image to base64...");
    let binaryStr = "";
    const bytes = request.imageBytes;
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binaryStr += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64Image = btoa(binaryStr);
    console.log("[gpt4o] Base64 ready, length:", base64Image.length);

    const locationContext = request.stateCode
      ? `The photo was taken in ${request.stateCode}, USA.`
      : request.lat && request.lon
        ? `The photo was taken at approximately ${request.lat.toFixed(2)}°N, ${request.lon.toFixed(2)}°W in the United States.`
        : "The photo was taken somewhere in North America.";

    const systemPrompt = `You are an expert ornithologist. Identify the bird species in the photo. ${locationContext}

You MUST respond with valid JSON only. No markdown, no explanation. Use this exact format:
{
  "candidates": [
    {
      "common_name": "Species Common Name",
      "scientific_name": "Genus species",
      "confidence": 0.95
    }
  ],
  "photo_quality": "good",
  "is_screen_photo": false,
  "setting": "on a bird feeder"
}

Rules:
- Return 1-5 candidates, ordered by confidence (highest first)
- Confidence is 0.0-1.0 reflecting how certain you are
- Include any bird species you can identify, not limited to any region
- If you cannot identify any bird in the image, return an empty candidates array
- Consider the location context to weight species likelihood
- photo_quality: Rate the photo as "pristine" (sharp, well-lit, bird fills frame, full body visible), "good" (clearly identifiable, decent lighting, reasonable distance), "fair" (identifiable with difficulty — distant, partially hidden, poor lighting, motion blur), or "poor" (barely identifiable — extreme blur, silhouette, tiny in frame)
- is_screen_photo: Set to true if the image appears to be a photograph of a screen, monitor, phone, TV, or tablet displaying a bird image, or a photograph of a printed photo, poster, or book rather than a direct photograph of a real live bird. Look for screen bezels, pixel grids, moiré patterns, reflections, screen glare, paper edges, glossy print reflections, or unnatural flatness
- setting: A short phrase (2-5 words) describing where the bird is observed in the photo, e.g. "on a bird feeder", "in a forest", "at a lake shore", "on a power line", "in a backyard", "on a branch", "in flight". Set to null if no bird is visible or the setting cannot be determined`;

    console.log("[gpt4o] Calling OpenAI API...");
    const startTime = performance.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${request.mimeType};base64,${base64Image}`,
                  detail: request.detail ?? "high",
                },
              },
              {
                type: "text",
                text: "Identify the bird species in this photo.",
              },
            ],
          },
        ],
      }),
    });

    console.log("[gpt4o] OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[gpt4o] OpenAI API error", { status: response.status, body: errorText.slice(0, 500) });
      throw new Error(`GPT-4o API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const latencySeconds = (performance.now() - startTime) / 1000;
    console.log("[gpt4o] Response content length:", content?.length, "usage:", data.usage, "latency:", latencySeconds.toFixed(2), "s");

    if (!content) {
      console.error("[gpt4o] No content in response", { choices: JSON.stringify(data.choices).slice(0, 200) });
      throw new Error("No content in GPT-4o response");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.error("[gpt4o] JSON parse failed", { content: content.slice(0, 500) });
      throw new Error(`Failed to parse GPT-4o response: ${content.slice(0, 200)}`);
    }

    console.log("[gpt4o] Parsed response", {
      candidateCount: parsed.candidates?.length,
      photo_quality: parsed.photo_quality,
      is_screen_photo: parsed.is_screen_photo,
      setting: parsed.setting,
    });

    const validQualities = ["pristine", "good", "fair", "poor"];
    const quality = validQualities.includes(parsed.photo_quality)
      ? parsed.photo_quality
      : "fair";

    return {
      candidates: (parsed.candidates || []).map(
        (c: { common_name: string; scientific_name: string; confidence: number }) => ({
          common_name: c.common_name,
          scientific_name: c.scientific_name,
          confidence: Math.max(0, Math.min(1, c.confidence)),
        })
      ),
      provider: "gpt-4o",
      raw: data,
      photo_quality: quality,
      is_screen_photo: parsed.is_screen_photo === true,
      setting: typeof parsed.setting === "string" ? parsed.setting : null,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        latencySeconds,
      },
    };
  }
}
