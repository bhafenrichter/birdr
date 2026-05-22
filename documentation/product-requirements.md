# birdr — Product Requirements (v1)

**Working title:** birdr
**Status:** Draft for review
**Last updated:** 2026-05-22
**Owner:** Brandon

---

## 1. Vision

birdr is a mobile app that turns casual bird watching into a personal collection game. Users photograph birds, AI identifies the species, and successful identifications create a collectible "card" — a polished, shareable summary of the species combined with the user's own sighting data. The collection grows over time, rewarding curiosity with new species cards, milestone achievements, and the daily ritual of going outside to look.

The product sits between two existing categories. Serious birding tools (Merlin, eBird) are accurate but utilitarian. Gamified nature apps (Pokémon GO) are fun but fictional. birdr aims for the middle: real birds, real ecology, a collection loop that makes you want to come back tomorrow.

## 2. Target user

The casual bird watcher — broadly anyone who notices birds in their yard, on walks, or while traveling, but doesn't consider themselves a "birder." They own a smartphone, use it as their primary camera, enjoy the satisfaction of collecting things, and are open to spending money on a hobby app at the $5/mo or $30/yr level.

Secondary audiences not directly targeted in v1, but should not be excluded by design: families with kids, serious birders looking for a more enjoyable logging app, and educators.

## 3. Product pillars

1. **The capture loop is the product.** Everything else (collection, achievements, streaks) serves the goal of getting users to photograph birds.
2. **Real data, real credibility.** No fictional species, no made-up facts. IUCN conservation status, real bird audio, accurate ranges.
3. **Casual-first.** A user who opens the app once a week should still feel rewarded. A user who opens it every day should feel super-rewarded.
4. **Personal, not social.** v1 is a private museum, not a feed. The collection you're building is your own.

## 4. MVP scope (v1)

In scope:

- Photograph a bird → AI identification → species card creation
- One card per species (Pokédex model); subsequent sightings update a sightings log on the existing card, not a new card
- Card content: species data + user's photo + first-sight metadata + bird call audio + range map + conservation status badge
- Collection browser: grid view, search by name, filter by family/habitat/conservation status, sort by date/name/rarity
- Daily streak tracker (strict: miss a day, reset)
- Achievement system across four categories: collection milestones, streak tiers, regional/geographic, family/category collector
- Free tier with daily ID limit; Weekly and Yearly subscriptions to remove the limit and unlock premium features
- North American species coverage (~900 species curated)
- US-only launch (App Store + Play Store, US storefronts)

Out of scope for v1 — planned for later releases:

- All social features (friends, feeds, leaderboards, comments)
- Card sharing/export, trading or gifting
- Multi-region species DB (Europe, Asia, etc.)
- Localization beyond English
- Tablet-optimized UI, Apple Watch
- Nearby rare-bird alerts (would require live eBird integration)
- Stylized/AI-illustrated card variants

## 5. Core user flows

### 5.1 First-time user onboarding

1. App launch → "Welcome to birdr" intro carousel (3-4 screens explaining the loop)
2. Sign up via Supabase auth (email/password + Apple/Google OAuth)
3. Permission requests with rationale: Camera (required), Location (required), Notifications (optional, recommended for streak reminders)
4. Sample capture walkthrough using a stock bird image — shows the Photo → ID → Card → Collection arc
5. Drop into the empty collection view with the CTA "Photograph your first bird"

### 5.2 Capture → ID → Card

1. User taps capture FAB on the collection screen
2. Camera opens; user takes a photo or selects from gallery
3. Preview screen with an "Identify" button
4. Upload to backend edge function with image + location
5. Backend calls cloud vision API, returns ranked species candidates with confidence scores
6. Branch on top-candidate confidence:
   - **≥85%:** Auto-accept, show card creation animation, return to collection
   - **60–85%:** Show top-3 candidate picker with thumbnails + names; user selects correct species
   - **<60%:** Show "Try again" with photo guidance (lighting, framing, get closer)
7. On successful ID:
   - **New species:** Card is created with a celebratory "First Sight!" animation
   - **Existing species:** Sighting count increments, new location added to per-card map, short toast "Spotted again!" (no full card animation, to keep repeat captures lightweight)
8. Streak counter updates if this is the first successful capture of the day

### 5.3 Browse collection

1. Collection screen shows captured species as a grid of card thumbnails (image + name + count badge)
2. Search bar at top filters by name
3. Filter chips below search: Family, Habitat, Conservation Status, Date range
4. Sort menu: Recently spotted, Alphabetical, Conservation rarity, Family
5. Tap a card → full-size card detail with all metadata + sightings log + per-card sightings map
6. Empty state: "Photograph your first bird" with tap-to-capture CTA

### 5.4 Achievements

1. Achievements tab in main navigation
2. Sections: Collection milestones, Streak tiers, Regional, Family collector
3. Each achievement card shows: name, description, progress (e.g., "7 of 10"), unlock state
4. Unlocked achievements show date earned; locked ones with progress show the criteria
5. Unlocking triggers a celebration overlay and an optional push notification

### 5.5 Streaks

1. Current streak shown as a chip in the Collection header (e.g., "🔥 12")
2. Streak detail screen accessible from profile: current streak, longest streak, calendar of capture days for the past 60 days
3. If the streak is broken (no successful capture by end of local day), counter resets at the start of the next day
4. Streaks are private — no leaderboards in v1

## 6. The bird card

The bird card is the central artifact of the app. Each species the user has photographed gets exactly one card per user.

### 6.1 Card anatomy (from the design reference)

**Top region**

- Family/order tag (small, e.g., "Songbird") top-left
- Common name (large, bold) below the family tag
- Habitat pill top-right (e.g., "Forests") with location pin icon

**Hero region**

- User's photo cropped to the bird, framed by the same color as the card border

**Body region** (three labeled fields)

- **Size:** Approximate length, imperial + metric
- **About:** Short editorial description, ~2–3 sentences, from the curated DB
- **First Sight:** Date + location label of the user's first sighting of this species

**Footer region**

- Conservation status circular badge (left): LC / NT / VU / EN / CR, IUCN-standard color coding
- Audio play button (center): plays the species' primary call/song
- Sighting count or family-collector badge (right): displays a number — final semantics TBD (see open questions)
- Background: illustrated landscape themed by the species' primary habitat (forest, wetland, grassland, desert, coast, urban, mountain)

**Frame**

- Border color reflects conservation rarity: LC = green/yellow, NT = yellow, VU = orange, EN = red, CR = deep red
- Adds visual variety to the collection grid without per-species custom art

A subtle framing note on rarity-by-conservation-status: rare cards should celebrate the species' protection (link to conservation info, donation prompts, "you spotted a protected species" copy) rather than treat the bird as a trophy. This keeps the gamification from feeling exploitative.

### 6.2 Taxonomy

birdr uses two parallel classification schemes that are surfaced on the card and used throughout the app for filtering, achievements, and visual themeing. These are deliberately user-friendly groupings, not strict scientific taxonomy — for example, "Songbirds" lumps together passerine families (sparrows, warblers, finches, thrushes, jays, blackbirds, wrens) that are taxonomically distinct but visually and behaviorally cohesive for casual users.

**Species type** — appears as the small tag at the top of the card (e.g., "Songbird"). Nine values:

| Type | Includes |
|---|---|
| Songbirds | Sparrows, warblers, finches, thrushes, jays, blackbirds, wrens |
| Birds of prey | Hawks, eagles, falcons, owls |
| Waterfowl | Ducks, geese, swans, loons, grebes |
| Wading birds | Herons, egrets, ibis, cranes, rails, bitterns |
| Shorebirds | Plovers, sandpipers, oystercatchers, avocets |
| Seabirds | Gulls, terns, albatrosses, shearwaters, puffins |
| Game birds | Quail, grouse, turkeys, pheasants, ptarmigan |
| Woodpeckers | Woodpeckers, sapsuckers, flickers |
| Aerial specialists | Hummingbirds, swifts, swallows, nightjars |

**Habitat** — appears as the habitat pill at the top-right of the card and drives the illustrated footer background. Nine values, each with representative species:

| Habitat | Representative species |
|---|---|
| Forests | Wood thrush, scarlet tanager, pileated woodpecker, ovenbird, boreal chickadee, Steller's jay, pine warbler |
| Grasslands & farmland | Bobolink, grasshopper sparrow, lark bunting, eastern meadowlark, barn owl, killdeer, horned lark |
| Deserts & scrublands | Sage grouse, cactus wren, Gambel's quail, roadrunner, elf owl, California thrasher, wrentit |
| Wetlands | Marsh wren, American bittern, sora, prothonotary warbler, wood duck, barred owl, Lincoln's sparrow |
| Freshwater | Common loon, hooded merganser, pied-billed grebe, American dipper, harlequin duck |
| Coasts & ocean | Piping plover, American oystercatcher, clapper rail, seaside sparrow, common murre, shearwaters, albatrosses |
| Mountains | Peregrine falcon, canyon wren, white-throated swift, golden eagle, white-tailed ptarmigan, gray-crowned rosy-finch |
| Tundra | Snowy owl, rock ptarmigan, Lapland longspur, snow bunting |
| Cities & towns | Northern cardinal, American robin, mourning dove, house finch, rock pigeon, house sparrow, European starling |

Each species in the curated DB is assigned exactly one species type and one primary habitat. (Some species occupy multiple habitats; for the card UI we pick the most representative one and store secondaries as an optional array for future use.)

**Card art implications:** The footer illustration is themed by habitat — nine distinct illustrated scenes to commission (forest, grassland, desert, wetland, freshwater, coast, mountain, tundra, urban). Owner will provide finished art separately.

### 6.3 Data on a card

**Species-level** (curated DB, shared across all users):

- Common name, scientific name (Latin binomial)
- Scientific family and order (for reference; not surfaced in UI)
- Species type (one of the 9 user-facing types in §6.2)
- Primary habitat (one of the 9 habitats in §6.2); optional secondary habitats array
- Conservation status (IUCN: LC / NT / VU / EN / CR)
- Size range (length; wingspan optional)
- Editorial description ("About" copy)
- Range map (global distribution)
- Primary audio asset (call/song)

**User-level** (per-user sighting data):

- User's photo (hero image)
- First sight date and location (named place, e.g., "backyard feeder")
- Sightings log: list of (date, location, photo) tuples
- Personal sighting count

## 7. Identification system

### 7.1 ID provider strategy

v1 uses a cloud vision API for identification. Three candidates to evaluate before locking in:

1. **Gemini Flash (Google)** — fast, cheap (~$0.01–0.03/call), strong general vision. Likely the cost/accuracy sweet spot for v1.
2. **Cornell Lab Merlin / iNaturalist Computer Vision** — bird-specialized, highest accuracy. Commercial ToS needs careful review — Merlin's API is currently not openly available; iNat CV has restrictions.
3. **Custom fine-tuned model** — train a North America bird classifier on iNaturalist Open Dataset. Highest accuracy ceiling and lowest unit cost at scale, but adds significant pre-launch ML work.

Tentative decision: Start with Gemini Flash for v1 to ship faster; benchmark against Merlin/iNat in parallel; revisit if accuracy or cost becomes a problem.

### 7.2 Confidence threshold UX

The cloud API returns ranked candidates with confidence scores. The app dispatches based on the top score:

| Top confidence | Behavior |
|---|---|
| ≥85% | Auto-accept; create or update card |
| 60–85% | Show top-3 candidate picker; user selects correct species |
| <60% | Show "Try again" with photo guidance |

These thresholds are placeholders. They must be empirically tuned with the actual ID provider on real photos before launch.

### 7.3 Edge cases

- **No bird in photo:** Confidence will be low → "Try again" flow. v1.1 could add an explicit "not a bird" classifier check.
- **Multiple birds in photo:** Identify the dominant subject; document the limitation; multi-subject ID is a v2 candidate.
- **Photo of a photo (cheating):** Not actively prevented in v1. Anti-cheat is over-engineering for a personal collection app with no leaderboards. Revisit when/if social features arrive.
- **Species not in DB:** Captures outside North America that aren't in our curated DB return low confidence → "Try again" prompt explaining the v1 scope.

### 7.4 Architectural reuse

The cloud ID call is implemented as a Supabase Edge Function per `documentation/EDGE-FUNCTION.md`. The function receives the photo + optional location, calls the vision API, and returns ranked candidates plus species metadata.

## 8. Streaks

### 8.1 Rules

- A "successful capture day" is any day (in the user's local time zone) on which the user creates or updates at least one card — a successful ID, not just opening the app
- Streak counts consecutive successful capture days
- If the user misses a day, the streak resets to 0 at the start of the next day
- Server validates capture timestamps to prevent timezone gaming

### 8.2 UX

- Current streak chip in the Collection header (e.g., "🔥 12")
- Streak detail screen: current streak, longest streak, calendar grid of past 60 days
- Optional evening push notification at a user-configurable time if no capture yet that day (default 6pm local)
- On streak loss, a non-judgmental morning message: "Your 12-day streak ended yesterday. Today is a new start."

### 8.3 Anti-churn (planned for v1.1)

Strict streaks drive engagement but also drive churn after the first reset. Plan to add a "streak revive" reward in v1.1 — earn a one-time freeze after unlocking the 7-day streak achievement.

## 9. Achievements

Four categories, each with multiple tiers.

### 9.1 Collection milestones

10, 25, 50, 100, 250, 500 species collected. A final aspirational tier at 900 (all NA species).

### 9.2 Streak tiers

7-day, 14-day, 30-day, 100-day, 365-day streaks. Lifetime stats; each is a one-time unlock.

### 9.3 Regional/geographic

- "First spot in [State]" — one per US state (50 achievements)
- "Bird tour" — collect species in 5, 10, 20 different states
- "Local expert" — 50 species in one state (rewards depth, not just travel)

### 9.4 Family/category collector

Complete-set achievements mapped 1:1 to the 9 species types from §6.2. Nine achievements at launch:

- Songbirds Master
- Birds of Prey Master
- Waterfowl Master
- Wading Birds Master
- Shorebirds Master
- Seabirds Master
- Game Birds Master
- Woodpeckers Master
- Aerial Specialists Master

Each unlocks when the user has collected every species in that type within North America. Lower tiers (e.g., "Songbirds Apprentice" at 25%, "Songbirds Adept" at 50%) likely exist between empty and complete to keep momentum visible — exact tier thresholds to be set during beta.

The "7" badge on the card design reference likely represents the user's progress in the family-collector achievement for that species' type (e.g., 7 of 33 woodpeckers collected). This is the working assumption — confirm in design review.

## 10. Monetization

### 10.1 Tiers

- **Free:** N daily ID attempts (N to be set during beta; suggested starting point: 3/day). Full access to existing collection and achievements; capture is blocked once the daily limit is hit.
- **Weekly subscription:** Unlimited IDs, all features. Suggested price ~$2.99/wk — to be validated.
- **Yearly subscription:** Unlimited IDs, all features. Suggested price ~$29.99/yr — ~50–65% savings vs. weekly. To be validated.

### 10.2 Premium features beyond unlimited IDs

To strengthen subscription value beyond the ID limit:

- Custom card themes (alternate frame styles, footer art variants)
- Export card as image (personal use; sharing UX comes in v2)
- Detailed analytics on personal collection (busiest park, most active month, etc.)
- Early access to new features (e.g., region expansions)

These are subscription perks, not in-app cosmetic purchases. v1 keeps the pricing model simple: one paywall, two billing periods.

### 10.3 Implementation

Use RevenueCat per `documentation/subscription-pattern.md`. Store API keys in ConfigCat per `documentation/configcat-pattern.md`. Track purchase events in PostHog per `documentation/posthog-pattern.md`.

## 11. Technical architecture

birdr inherits the engineering patterns documented in `documentation/`. Reuse without modification where possible.

### 11.1 Frontend

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation per `navigation-pattern.md`
- Atomic design system per `atomic-design-pattern.md` and `atomic-design-extended-atoms.md`
- Haptic feedback per `haptic-feedback-pattern.md`

### 11.2 Backend

- Supabase (auth, Postgres, edge functions, storage)
- Edge function for bird ID per `EDGE-FUNCTION.md`
- Edge function for server-side streak validation
- User photo storage per `upload-pattern.md`

### 11.3 Services

- Sentry — error tracking (`sentry-pattern.md`)
- PostHog — product analytics (`posthog-pattern.md`)
- ConfigCat — feature flags and remote config (`configcat-pattern.md`)
- RevenueCat — subscriptions (`subscription-pattern.md`)

### 11.4 Database schema (high level)

- `species` — curated bird DB, ~900 rows (includes `species_type` and `primary_habitat` enums from §6.2)
- `species_assets` — references to audio, illustrations, range maps
- `users` — Supabase auth users
- `customer_accounts` — backend customer records keyed by Supabase user_id
- `sightings` — every successful capture (user_id, species_id, photo_url, captured_at, lat, lon, named_location)
- `cards` — per-user-per-species aggregate (user_id, species_id, first_seen_at, last_seen_at, sighting_count, hero_photo_url)
- `streaks` — per-user (user_id, current_streak, longest_streak, last_capture_date)
- `achievements` — per-user (user_id, achievement_id, unlocked_at, progress)

A note on the schema: `sightings.lat/lon` should be stored as precise coordinates but a separate `display_location` field (named place, fuzzed location) should be added now even though v1 doesn't use it publicly. This avoids a painful migration when social features arrive in v2.

### 11.5 E2E testing

Maestro per `e2e-testing-pattern.md`. Critical flows to cover at launch:

- First-time signup → permission grants → first capture
- High-confidence capture creates a new card
- Low-confidence capture shows the top-3 picker
- Repeat capture of an existing species updates the sightings log
- Streak increments on first daily capture
- Streak resets after a missed day (with mocked time)
- Subscription paywall and RevenueCat sandbox purchase
- Collection search and filter

## 12. Data sources and curation

### 12.1 Custom curated DB

The 900-species North American bird DB is the highest-effort pre-launch task. Strategy:

- Source common names, taxonomy, conservation status, size, and habitat from authoritative sources (eBird taxonomy, IUCN Red List, Cornell Lab Birds of the World)
- LLM-assisted drafts of "About" editorial copy, then human review for accuracy on every entry
- Audio from xeno-canto (CC-licensed bird recordings) — verify license compatibility per recording
- Range maps from BirdLife International or similar — license check required
- Manual QA pass on every species before launch; quality matters more than coverage

Estimated effort: 2–3 focused months for one person, less with assistance.

### 12.2 Asset hosting

Static assets (audio, range maps, illustrations) hosted on Supabase storage with CDN. Avoid in-app bundling unless total size stays under ~50 MB.

## 13. Privacy and permissions

### 13.1 Permissions

- **Camera:** Required. Requested with a clear rationale on the permission prompt.
- **Photo Library:** Optional. For importing existing photos.
- **Location:** Required for v1. Requested as "When in Use," never "Always."
- **Notifications:** Optional, recommended for streak reminders and achievement unlocks.

### 13.2 Data handling

- User photos stored in Supabase storage, scoped to the user's account
- Precise GPS coordinates stored alongside each sighting (no fuzzing in v1 since nothing is publicly shared)
- App Privacy disclosures: "Precise Location," "Photos," "User Content"
- Account deletion flow per App Store requirements

### 13.3 Future-proofing for social

When v2 introduces social features, public-facing sighting locations must be fuzzed (round to nearest named place ≥1 km radius) to protect users from accidentally revealing home addresses. The schema should support both `precise_lat/lon` (private) and `display_location` (public, fuzzed) from v1.

## 14. Open questions

1. **Card "7" badge semantics:** Is it per-species sighting count, family-collector progress, or both layered? Confirm in design review.
2. **Audio button UX:** Single tap-to-play, or expandable selector for song/call/alarm-call?
3. **Card flip vs. detail screen:** Does the card flip to reveal a sightings log, or is the log a separate detail view?
4. **First Sight permanence:** Frozen forever, or editable?
5. **ID provider final pick:** Lock Gemini Flash or evaluate Merlin/iNat ToS for commercial use?
6. **Daily free ID limit (N):** Suggested 3/day — needs validation during beta
7. **Subscription pricing:** Weekly and yearly final prices — competitive analysis pending
8. **Onboarding length:** How many tutorial screens before dropping into the app?
9. **Notification defaults:** Default reminder time, user customization scope
10. **At the daily ID limit for free users:** Hard block + paywall, or a soft "preview" of what they would have caught?

## 15. Success metrics

**Primary**

- D1, D7, D30 retention — does the streak loop actually drive retention?
- % of users with ≥1 successful capture in their first session — measures onboarding effectiveness
- % of users converting to subscription within 30 days — measures monetization

**Secondary**

- Average captures per active user per week
- Average species in a user's collection at 30 days
- Streak length distribution (especially 7-day and 30-day milestones)
- ID accuracy distribution: % of captures that auto-accept vs. show picker vs. fail
- Cost per ID (cloud API spend ÷ total IDs)

## 16. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloud ID accuracy too low for casual users | M | H | Beta-test with real users before launch; consider Merlin/iNat fallback |
| Cloud ID cost balloons as usage scales | M | M | Tight free-tier limit; consider custom model if unit economics break |
| DB curation takes longer than expected | H | M | Start curation in parallel with engineering; LLM-assisted drafts |
| Strict streak drives churn after first reset | H | M | Plan "streak revive" reward in v1.1 |
| App Store rejection over location data | L | H | Conservative privacy disclosure; consider fuzzing earlier if Apple pushes back |
| Non-bird photos clutter the ID model | L | L | Confidence threshold + "try again" handles this naturally |
| Casual NA-only DB feels limiting to global users | M | L | Geofence App Store to US for v1 (already planned) |

---

**Next steps**

1. Resolve the open questions in §14 (especially the card "7" badge and ID provider pick)
2. Begin DB curation work in parallel with engineering scaffolding
3. Stand up the Supabase project (auth, schema migration, edge functions stub)
4. Build the capture → ID → card vertical slice as the first engineering milestone
5. Beta test with 20–50 casual bird watchers before public launch
