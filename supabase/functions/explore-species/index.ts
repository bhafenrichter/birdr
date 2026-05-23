/**
 * explore-species edge function
 *
 * Returns species expected in the user's area, joined with their
 * personal sighting status. Powers the Explore tab's "Near me" and
 * "Region" modes.
 *
 * Request: GET with query params
 *   - lat: number (required)
 *   - lon: number (required)
 *   - mode: "near_me" | "region" (default: "near_me")
 *   - season_filter: "current" | "all" (default: "all")
 *   - species_type_slug: string (optional filter)
 *   - limit: number (default: 100)
 *   - offset: number (default: 0)
 *
 * Response: JSON
 *   {
 *     header: { season, location_name, state_code, total_species },
 *     species: [{
 *       species_id, common_name, scientific_name, species_type,
 *       habitat, conservation_status, season, peak_frequency,
 *       spotted: boolean, sighting_count
 *     }]
 *   }
 *
 * Ordering: unspotted species first (chase mode), then by frequency DESC.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/supabase.ts";
import { createAdminClient } from "../_shared/supabase.ts";

// Simple US state bounding boxes for point-in-polygon resolution
// Format: [minLat, maxLat, minLon, maxLon]
const STATE_BOUNDS: Record<string, [number, number, number, number]> = {
  "US-AL": [30.22, 35.01, -88.47, -84.89],
  "US-AK": [51.21, 71.39, -179.15, -129.98],
  "US-AZ": [31.33, 37.00, -114.81, -109.04],
  "US-AR": [33.00, 36.50, -94.62, -89.64],
  "US-CA": [32.53, 42.01, -124.48, -114.13],
  "US-CO": [36.99, 41.00, -109.06, -102.04],
  "US-CT": [40.99, 42.05, -73.73, -71.79],
  "US-DE": [38.45, 39.84, -75.79, -75.05],
  "US-FL": [24.40, 31.00, -87.63, -80.03],
  "US-GA": [30.36, 35.00, -85.61, -80.84],
  "US-HI": [18.91, 22.24, -160.25, -154.81],
  "US-ID": [41.99, 49.00, -117.24, -111.04],
  "US-IL": [36.97, 42.51, -91.51, -87.02],
  "US-IN": [37.77, 41.76, -88.10, -84.78],
  "US-IA": [40.38, 43.50, -96.64, -90.14],
  "US-KS": [36.99, 40.00, -102.05, -94.59],
  "US-KY": [36.50, 39.15, -89.57, -81.96],
  "US-LA": [28.93, 33.02, -94.04, -88.82],
  "US-ME": [43.06, 47.46, -71.08, -66.95],
  "US-MD": [37.91, 39.72, -79.49, -75.05],
  "US-MA": [41.24, 42.89, -73.51, -69.93],
  "US-MI": [41.70, 48.26, -90.42, -82.42],
  "US-MN": [43.50, 49.38, -97.24, -89.49],
  "US-MS": [30.17, 34.99, -91.66, -88.10],
  "US-MO": [36.00, 40.61, -95.77, -89.10],
  "US-MT": [44.36, 49.00, -116.05, -104.04],
  "US-NE": [40.00, 43.00, -104.05, -95.31],
  "US-NV": [35.00, 42.00, -120.01, -114.04],
  "US-NH": [42.70, 45.31, -72.56, -70.70],
  "US-NJ": [38.93, 41.36, -75.56, -73.89],
  "US-NM": [31.33, 37.00, -109.05, -103.00],
  "US-NY": [40.50, 45.02, -79.76, -71.86],
  "US-NC": [33.84, 36.59, -84.32, -75.46],
  "US-ND": [45.94, 49.00, -104.05, -96.55],
  "US-OH": [38.40, 42.33, -84.82, -80.52],
  "US-OK": [33.62, 37.00, -103.00, -94.43],
  "US-OR": [41.99, 46.29, -124.57, -116.46],
  "US-PA": [39.72, 42.27, -80.52, -74.69],
  "US-RI": [41.15, 42.02, -71.86, -71.12],
  "US-SC": [32.05, 35.22, -83.35, -78.54],
  "US-SD": [42.48, 45.95, -104.06, -96.44],
  "US-TN": [34.98, 36.68, -90.31, -81.65],
  "US-TX": [25.84, 36.50, -106.65, -93.51],
  "US-UT": [36.99, 42.00, -114.05, -109.04],
  "US-VT": [42.73, 45.02, -73.44, -71.46],
  "US-VA": [36.54, 39.47, -83.68, -75.24],
  "US-WA": [45.54, 49.00, -124.85, -116.92],
  "US-WV": [37.20, 40.64, -82.64, -77.72],
  "US-WI": [42.49, 47.08, -92.89, -86.25],
  "US-WY": [40.99, 45.01, -111.06, -104.05],
};

// State names for display headers
const STATE_NAMES: Record<string, string> = {
  "US-AL": "Alabama", "US-AK": "Alaska", "US-AZ": "Arizona", "US-AR": "Arkansas",
  "US-CA": "California", "US-CO": "Colorado", "US-CT": "Connecticut", "US-DE": "Delaware",
  "US-FL": "Florida", "US-GA": "Georgia", "US-HI": "Hawaii", "US-ID": "Idaho",
  "US-IL": "Illinois", "US-IN": "Indiana", "US-IA": "Iowa", "US-KS": "Kansas",
  "US-KY": "Kentucky", "US-LA": "Louisiana", "US-ME": "Maine", "US-MD": "Maryland",
  "US-MA": "Massachusetts", "US-MI": "Michigan", "US-MN": "Minnesota", "US-MS": "Mississippi",
  "US-MO": "Missouri", "US-MT": "Montana", "US-NE": "Nebraska", "US-NV": "Nevada",
  "US-NH": "New Hampshire", "US-NJ": "New Jersey", "US-NM": "New Mexico", "US-NY": "New York",
  "US-NC": "North Carolina", "US-ND": "North Dakota", "US-OH": "Ohio", "US-OK": "Oklahoma",
  "US-OR": "Oregon", "US-PA": "Pennsylvania", "US-RI": "Rhode Island", "US-SC": "South Carolina",
  "US-SD": "South Dakota", "US-TN": "Tennessee", "US-TX": "Texas", "US-UT": "Utah",
  "US-VT": "Vermont", "US-VA": "Virginia", "US-WA": "Washington", "US-WV": "West Virginia",
  "US-WI": "Wisconsin", "US-WY": "Wyoming",
};

function resolveStateCode(lat: number, lon: number): string | null {
  // Find the state whose bounding box contains this point
  // For border areas, pick the closest centroid
  let bestState: string | null = null;
  let bestDist = Infinity;

  for (const [code, [minLat, maxLat, minLon, maxLon]] of Object.entries(STATE_BOUNDS)) {
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      // Point is inside bounding box — compute distance to centroid
      const centLat = (minLat + maxLat) / 2;
      const centLon = (minLon + maxLon) / 2;
      const dist = Math.pow(lat - centLat, 2) + Math.pow(lon - centLon, 2);
      if (dist < bestDist) {
        bestDist = dist;
        bestState = code;
      }
    }
  }

  return bestState;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Fall";
  return "Winter";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user } = await getAuthUser(req);
    const admin = createAdminClient();

    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") || "");
    const lon = parseFloat(url.searchParams.get("lon") || "");
    const mode = url.searchParams.get("mode") || "near_me";
    const seasonFilter = url.searchParams.get("season_filter") || "all";
    const speciesTypeSlug = url.searchParams.get("species_type_slug");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (isNaN(lat) || isNaN(lon)) {
      return new Response(
        JSON.stringify({ error: "lat and lon query parameters are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve lat/lon to US state
    const stateCode = resolveStateCode(lat, lon);
    if (!stateCode) {
      return new Response(
        JSON.stringify({
          error: "location_outside_coverage",
          message: "We don't have nearby data for this location yet — try Region.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query for species in this state
    let query = admin
      .from("species_regions")
      .select(`
        species_id,
        season,
        peak_frequency,
        species!inner(
          id,
          common_name,
          scientific_name,
          conservation_status,
          distinguishing_feature,
          species_type_id,
          primary_habitat_id,
          species_types!inner(name, slug),
          habitats!inner(name, slug)
        )
      `)
      .eq("state_code", stateCode);

    // Apply season filter
    if (seasonFilter === "current") {
      const month = new Date().getMonth() + 1;
      const seasonValues = ["year_round"];
      if (month >= 4 && month <= 9) seasonValues.push("summer");
      if (month <= 3 || month >= 10) seasonValues.push("winter");
      seasonValues.push("migratory");
      query = query.in("season", seasonValues);
    }

    // Apply species type filter
    if (speciesTypeSlug) {
      query = query.eq("species.species_types.slug", speciesTypeSlug);
    }

    const { data: regionSpecies, error: queryError } = await query;

    if (queryError) {
      return new Response(
        JSON.stringify({ error: `Query failed: ${queryError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's spotted species in this set
    const speciesIds = regionSpecies?.map((r: any) => r.species_id) ?? [];
    const { data: userSightings } = await admin
      .from("sightings")
      .select("species_id")
      .eq("user_id", user.id)
      .in("species_id", speciesIds);

    const spottedSet = new Set(userSightings?.map((s) => s.species_id) ?? []);

    // Count sightings per species
    const { data: sightingCounts } = await admin
      .from("sightings")
      .select("species_id")
      .eq("user_id", user.id)
      .in("species_id", speciesIds);

    const countMap = new Map<string, number>();
    for (const s of sightingCounts ?? []) {
      countMap.set(s.species_id, (countMap.get(s.species_id) || 0) + 1);
    }

    // Shape response
    const shaped = (regionSpecies ?? []).map((r: any) => ({
      species_id: r.species_id,
      common_name: r.species.common_name,
      scientific_name: r.species.scientific_name,
      species_type: r.species.species_types.name,
      habitat: r.species.habitats.name,
      conservation_status: r.species.conservation_status,
      distinguishing_feature: r.species.distinguishing_feature,
      season: r.season,
      peak_frequency: r.peak_frequency,
      spotted: spottedSet.has(r.species_id),
      sighting_count: countMap.get(r.species_id) || 0,
    }));

    // Sort: unspotted first, then by peak_frequency DESC
    shaped.sort((a: any, b: any) => {
      if (a.spotted !== b.spotted) return a.spotted ? 1 : -1;
      return (b.peak_frequency ?? 0) - (a.peak_frequency ?? 0);
    });

    // Paginate
    const paginated = shaped.slice(offset, offset + limit);

    const stateName = STATE_NAMES[stateCode] || stateCode;
    const season = getCurrentSeason();

    return new Response(
      JSON.stringify({
        header: {
          season,
          location_name: stateName,
          state_code: stateCode,
          total_species: shaped.length,
          spotted_count: shaped.filter((s: any) => s.spotted).length,
        },
        species: paginated,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
