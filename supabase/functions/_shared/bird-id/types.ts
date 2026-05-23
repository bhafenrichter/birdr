/**
 * IoC interface for bird identification providers.
 * Concrete adapters implement this interface; the edge function
 * consumes only the interface, never the concrete provider.
 */

export interface BirdIdCandidate {
  common_name: string;
  scientific_name: string;
  confidence: number; // 0.0 - 1.0
}

export interface BirdIdRequest {
  imageBytes: Uint8Array;
  mimeType: string;
  lat?: number;
  lon?: number;
  stateCode?: string; // e.g. "US-NC" for region context
}

export interface BirdIdResponse {
  candidates: BirdIdCandidate[];
  provider: string;
  raw?: unknown; // Provider-specific raw response for debugging
}

export interface BirdIdProvider {
  identify(request: BirdIdRequest): Promise<BirdIdResponse>;
}
