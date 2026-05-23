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
    const base64Image = btoa(
      String.fromCharCode(...request.imageBytes)
    );

    const locationContext = request.stateCode
      ? `The photo was taken in ${request.stateCode}, USA.`
      : request.lat && request.lon
        ? `The photo was taken at approximately ${request.lat.toFixed(2)}°N, ${request.lon.toFixed(2)}°W in the United States.`
        : "The photo was taken somewhere in North America.";

    const systemPrompt = `You are an expert ornithologist specializing in North American birds. Identify the bird species in the photo. ${locationContext}

You MUST respond with valid JSON only. No markdown, no explanation. Use this exact format:
{
  "candidates": [
    {
      "common_name": "Species Common Name",
      "scientific_name": "Genus species",
      "confidence": 0.95
    }
  ]
}

Rules:
- Return 1-5 candidates, ordered by confidence (highest first)
- Confidence is 0.0-1.0 reflecting how certain you are
- Only include North American bird species
- Use standard AOU/eBird common names
- If you cannot identify any bird in the image, return an empty candidates array
- Consider the location context to weight species likelihood`;

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
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${request.mimeType};base64,${base64Image}`,
                  detail: "high",
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GPT-4o API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in GPT-4o response");
    }

    const parsed = JSON.parse(content);

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
    };
  }
}
