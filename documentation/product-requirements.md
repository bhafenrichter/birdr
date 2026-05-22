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
- Explore surface: eBird-powered "what birds are near me," common-species-in-region list, personal global sightings map
- Daily streak tracker (strict: miss a day, reset)
- Achievement system across four categories: collection milestones, streak tiers, regional/geographic, family/category collector
- Free tier with daily ID limit; Weekly and Yearly subscriptions to remove the limit and unlock premium features
- North American species coverage (~900 species curated)
- US-only launch (App Store + Play Store, US storefronts)

Out of scope for v1 — planned for later releases:

- **Audio-based identification** (record a bird call → AI identifies it). Deferred to v2.
- All social features (friends, feeds, leaderboards, comments)
- Card sharing/export, trading or gifting
- Multi-region species DB (Europe, Asia, etc.)
- Localization beyond English
- Tablet-optimized UI, Apple Watch
- Nearby rare-bird alerts (push notifications driven by live eBird data)
- Stylized/AI-illustrated card variants

## 5. Information architecture

birdr is organized as a four-tab app, with Capture as the default landing tab. This reflects the product pillar that the capture loop *is* the product.

### 5.1 Tab structure

The bottom tab bar, from left to right:

| Tab | Icon | Purpose |
|---|---|---|
| Capture | Binoculars | Camera viewfinder. The default landing tab. (Audio recording reserved for v2.) |
| Collection | Book | Browse your collected species cards. |
| Explore | Search / compass | Discover what birds are near you + your global sightings map. |
| Profile | User | Achievements, streak, subscription, settings. |

The Capture tab is the visual centerpiece of the tab bar — the binoculars icon, possibly raised or accented, anchors the bar and signals the headline action.

### 5.2 Default landing

The app opens to the Capture tab — but the tab itself is a **stats and motivation hub**, not the camera. Tapping a large central capture button inside the hub launches the camera as a separate fullscreen screen (with the tab bar hidden). This decouples "I have the app open" from "the camera is hot" — softer first impression, and a natural surface for the streak and capture stats that would otherwise be buried in Profile.

Exception: First-time users land on the welcome carousel and tutorial flow, then drop into the Capture hub.

### 5.3 Screen inventory by tab

**Capture tab (~2 screens) and capture flow (~5 screens)**

The Capture tab itself:

- Capture hub (default for the tab) — streak prominently displayed, today's capture status, recent captures preview, daily ID quota for free users, big central capture button
- (Future) Bird-of-the-day card surfacing today's featured species

The capture flow, launched from the hub's central button as a fullscreen modal experience without the tab bar:

- Camera viewfinder (fullscreen, tab bar hidden)
- Photo preview + "Identify" CTA
- Identifying (loading)
- ID result: new species card created (full-screen celebration)
- ID result: existing species sighting added (toast + brief animation, returns to viewfinder)
- ID result: top-3 picker (low confidence)
- ID result: try again (very low confidence, with photo guidance)

Closing the capture flow (X in the top corner, or back gesture) returns the user to the Capture hub with the tab bar restored.

**Collection tab (~7 screens)**

- Collection grid (default)
- Search results
- Filter sheet (bottom sheet — Species type, Habitat, Conservation status, Date range)
- Sort menu
- Card detail (full card art + About + range map + footer badges)
- Card sightings log (every time you've spotted this species)
- Card per-species map (pins on a map for every sighting of this species)

**Explore tab (~4 screens)**

- Explore map (default) — birds reported near the user, pulled from the eBird "recent observations nearby" API, with map pins per species
- Common species list — scrollable list of birds frequently seen in the user's region, with a "spotted / not spotted" status overlay derived from the user's collection
- My global map — the user's personal sightings worldwide
- Species preview (modal) — tap any bird in the map or list to see a preview card with sighting status; can deep-link to the user's existing card if they've already collected the species

The Explore tab does *not* include hotspots in v1 (deferred — fine candidate for v1.1 if Explore engagement is strong).

**Profile tab (~10 screens)**

- Profile home (avatar, total species, current streak chip, lifetime stats)
- Achievements hub (sections: Collection, Streaks, Regional, Family)
- Achievement section detail
- Achievement detail (progress, criteria, unlock date)
- Streak detail (calendar of capture days)
- Account settings (email, password, sign out, delete account)
- Notification settings (streak reminder time, achievement alerts)
- App preferences (haptics, units imperial/metric, theme)
- Subscription management (current plan, restore purchases, upgrade)
- Help / About / Privacy / Terms / Support

**Onboarding & system modals**

- Welcome carousel (first-launch only)
- Sign in / Sign up / Forgot password
- Permission explainer (camera, location, notifications — sequential prompts with rationale)
- Tutorial capture (first-time user only)
- Hard paywall (triggered when a free user hits the daily ID limit)
- Soft upsell (accessible anytime from Profile)
- Achievement unlock celebration overlay

Total: roughly 30 distinct screens / states across the four tabs and system modals. Sized correctly for a focused v1.

### 5.4 Design rationale

- **Capture as a tab, not a FAB.** Photography is the primary action, not a secondary feature. Putting it in the tab bar commits to that positioning.
- **Capture hub, not the camera directly.** Opening to a live camera every time is jarring. The hub gives the streak, capture stats, and motivation a home, and signals "you're about to start a focused activity" before the lens turns on.
- **Camera as a fullscreen modal without the tab bar.** Hiding the tabs during capture creates a focus mode — visually and ergonomically, the user knows they're in a different state.
- **Collection separate from Capture.** Browsing your collection is a contemplative mode, distinct from the "I want to shoot something right now" intent of Capture. Mixing them dilutes both.
- **Explore as a dedicated tab.** Discovery (what's nearby? what should I look for?) is a different mode from capture or browsing. eBird's "recent observations" API gives this surface real, fresh data without requiring birdr to build a community.
- **Profile absorbs Achievements + Settings.** Achievements and streaks are personal stats; they live with the user's other personal context. Saves a tab and avoids splitting the "me" surface area.

### 5.5 Capture hub content (v1)

The Capture hub is a calm, motivational surface — not a busy dashboard. Proposed elements, in priority order:

1. **Streak chip** — current streak count, prominent. Visual treatment driven by a custom animation (per design direction).
2. **Today's capture status** — "Capture today to keep your streak" if no capture yet; "Streak safe ✓" after first capture of the day.
3. **Central capture button** — large circular button, branded; tapping launches the camera fullscreen modal.
4. **Daily ID quota** (free tier only) — "2 of 3 captures left today" with subtle upgrade nudge once limit is hit.
5. **Recent captures preview** — horizontal scroll of the user's last 3–5 cards, tappable to deep-link into Collection card detail.

Out of scope for v1 hub (candidates for v1.1+): bird-of-the-day featured species, weather/conditions, target species suggestions from Explore.

## 6. Core user flows

### 6.1 First-time user onboarding

1. App launch → splash → welcome carousel (3–4 slides explaining the loop)
2. Sign up via Supabase auth (email/password + Apple/Google OAuth)
3. Permission requests with rationale: Camera (required), Location (required), Notifications (optional, recommended)
4. Tutorial capture using a stock bird image — walks through Photo → ID → Card → Collection
5. Drop into the Capture tab (camera viewfinder), with a small "Photograph your first bird" coach-mark

### 6.2 Capture → ID → Card

1. User is on the Capture tab (the hub) — sees their streak, today's status, recent captures, and a large central capture button
2. User taps the central capture button → the camera launches as a fullscreen modal screen (tab bar hidden, X close in top corner)
3. Camera viewfinder is live; user takes a photo or selects from gallery
4. Preview screen with an "Identify" button
5. Upload to backend edge function with image + location
6. Backend calls cloud vision API, returns ranked species candidates with confidence scores
7. Branch on top-candidate confidence:
   - **≥85%:** Auto-accept, show card creation animation
   - **60–85%:** Show top-3 candidate picker with thumbnails + names; user selects correct species
   - **<60%:** Show "Try again" with photo guidance (lighting, framing, get closer)
8. On successful ID:
   - **New species:** Card is created with a celebratory "First Sight!" animation, then user can dismiss back to the Capture hub or open the full card
   - **Existing species:** Sighting count increments, new location added to per-card map, short toast "Spotted again!" — returns to viewfinder ready for the next shot
9. Streak counter updates if this is the first successful capture of the day
10. Closing the capture flow (X) returns to the Capture hub with the streak chip and today's status reflecting any new capture

### 6.3 Browse collection

1. User taps the Collection tab → grid of card thumbnails (image + name + count badge)
2. Search bar at top filters by name
3. Filter chips below search: Species type, Habitat, Conservation status, Date range
4. Sort menu: Recently spotted, Alphabetical, Conservation rarity, Family
5. Tap a card → full-size card detail with all metadata + sightings log + per-card sightings map
6. Empty state: "Photograph your first bird" with a tap-to-Capture-tab CTA

### 6.4 Explore: what's near me

1. User taps the Explore tab → opens to the Explore map by default
2. Map centers on the user's current location, showing pins for recent bird observations from eBird (within a configurable radius, default ~25 km)
3. Tap a pin → species preview modal (photo, name, when/where it was last reported, "Spotted / Not yet" status from user's collection)
4. Toggle at top switches between three surfaces: Map (nearby), Common species (list), My global map (personal)
5. From any species preview, user can deep-link to their existing card (if collected) or save it as a target species (v1.1 — for now just close)

### 6.5 Achievements

1. User taps Profile tab → Achievements hub
2. Sections: Collection milestones, Streaks, Regional, Family collector
3. Each achievement card shows: name, description, progress (e.g., "7 of 10"), unlock state
4. Unlocked achievements show date earned; locked ones with progress show the criteria
5. Unlocking triggers a celebration overlay and an optional push notification

### 6.6 Streaks

1. Current streak chip shown in the Capture or Collection header (e.g., "🔥 12")
2. Streak detail screen reached from Profile: current streak, longest streak, calendar of capture days for the past 60 days
3. If the streak is broken (no successful capture by end of local day), counter resets at the start of the next day

## 7. The bird card

The bird card is the central artifact of the app. Each species the user has photographed gets exactly one card per user.

### 7.1 Card anatomy (from the design reference)

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
- Background: illustrated landscape themed by the species' primary habitat (forest, wetland, grassland, desert, coast, urban, mountain, tundra, freshwater)

**Frame**

- Border color reflects conservation rarity: LC = green/yellow, NT = yellow, VU = orange, EN = red, CR = deep red
- Adds visual variety to the collection grid without per-species custom art

A subtle framing note on rarity-by-conservation-status: rare cards should celebrate the species' protection (link to conservation info, donation prompts, "you spotted a protected species" copy) rather than treat the bird as a trophy. This keeps the gamification from feeling exploitative.

### 7.2 Taxonomy

birdr uses two parallel classification schemes that are surfaced on the card and used throughout the app for filtering, achievements, and visual theming. These are deliberately user-friendly groupings, not strict scientific taxonomy — for example, "Songbirds" lumps together passerine families (sparrows, warblers, finches, thrushes, jays, blackbirds, wrens) that are taxonomically distinct but visually and behaviorally cohesive for casual users.

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

### 7.3 Data on a card

**Species-level** (curated DB, shared across all users):

- Common name, scientific name (Latin binomial)
- Scientific family and order (for reference; not surfaced in UI)
- Species type (one of the 9 user-facing types in §7.2)
- Primary habitat (one of the 9 habitats in §7.2); optional secondary habitats array
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

## 8. Identification system

### 8.1 ID provider strategy

v1 uses a cloud vision API for identification. Three candidates to evaluate before locking in:

1. **Gemini Flash (Google)** — fast, cheap (~$0.01–0.03/call), strong general vision. Likely the cost/accuracy sweet spot for v1.
2. **Cornell Lab Merlin / iNaturalist Computer Vision** — bird-specialized, highest accuracy. Commercial ToS needs careful review — Merlin's API is currently not openly available; iNat CV has restrictions.
3. **Custom fine-tuned model** — train a North America bird classifier on iNaturalist Open Dataset. Highest accuracy ceiling and lowest unit cost at scale, but adds significant pre-launch ML work.

Tentative decision: Start with Gemini Flash for v1 to ship faster; benchmark against Merlin/iNat in parallel; revisit if accuracy or cost becomes a problem.

### 8.2 Confidence threshold UX

The cloud API returns ranked candidates with confidence scores. The app dispatches based on the top score:

| Top confidence | Behavior |
|---|---|
| ≥85% | Auto-accept; create or update card |
| 60–85% | Show top-3 candidate picker; user selects correct species |
| <60% | Show "Try again" with photo guidance |

These thresholds are placeholders. They must be empirically tuned with the actual ID provider on real photos before launch.

### 8.3 Edge cases

- **No bird in photo:** Confidence will be low → "Try again" flow. v1.1 could add an explicit "not a bird" classifier check.
- **Multiple birds in photo:** Identify the dominant subject; document the limitation; multi-subject ID is a v2 candidate.
- **Photo of a photo (cheating):** Not actively prevented in v1. Anti-cheat is over-engineering for a personal collection app with no leaderboards. Revisit when/if social features arrive.
- **Species not in DB:** Captures outside North America that aren't in our curated DB return low confidence → "Try again" prompt explaining the v1 scope.

### 8.4 Architectural reuse

The cloud ID call is implemented as a Supabase Edge Function per `documentation/EDGE-FUNCTION.md`. The function receives the photo + optional location, calls the vision API, and returns ranked candidates plus species metadata.

## 9. Streaks

### 9.1 Rules

- A "successful capture day" is any day (in the user's local time zone) on which the user creates or updates at least one card — a successful ID, not just opening the app
- Streak counts consecutive successful capture days
- If the user misses a day, the streak resets to 0 at the start of the next day
- Server validates capture timestamps to prevent timezone gaming

### 9.2 UX

- Current streak chip in the Capture or Collection header (e.g., "🔥 12")
- Streak detail screen accessible from the Profile tab: current streak, longest streak, calendar grid of past 60 days
- Optional evening push notification at a user-configurable time if no capture yet that day (default 6pm local)
- On streak loss, a non-judgmental morning message: "Your 12-day streak ended yesterday. Today is a new start."

### 9.3 Anti-churn (planned for v1.1)

Strict streaks drive engagement but also drive churn after the first reset. Plan to add a "streak revive" reward in v1.1 — earn a one-time freeze after unlocking the 7-day streak achievement.

## 10. Achievements

Four categories, each with multiple tiers. Achievements live in the Achievements hub inside the Profile tab.

### 10.1 Collection milestones

10, 25, 50, 100, 250, 500 species collected. A final aspirational tier at 900 (all NA species).

### 10.2 Streak tiers

7-day, 14-day, 30-day, 100-day, 365-day streaks. Lifetime stats; each is a one-time unlock.

### 10.3 Regional/geographic

- "First spot in [State]" — one per US state (50 achievements)
- "Bird tour" — collect species in 5, 10, 20 different states
- "Local expert" — 50 species in one state (rewards depth, not just travel)

### 10.4 Family/category collector

Complete-set achievements mapped 1:1 to the 9 species types from §7.2. Nine achievements at launch:

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

## 11. Monetization

### 11.1 Tiers

- **Free:** N daily ID attempts (N to be set during beta; suggested starting point: 3/day). Full access to existing collection, achievements, and Explore; capture is blocked once the daily limit is hit.
- **Weekly subscription:** Unlimited IDs, all features. Suggested price ~$2.99/wk — to be validated.
- **Yearly subscription:** Unlimited IDs, all features. Suggested price ~$29.99/yr — ~50–65% savings vs. weekly. To be validated.

### 11.2 Premium features beyond unlimited IDs

To strengthen subscription value beyond the ID limit:

- Custom card themes (alternate frame styles, footer art variants)
- Export card as image (personal use; sharing UX comes in v2)
- Detailed analytics on personal collection (busiest park, most active month, etc.)
- Early access to new features (e.g., region expansions, audio ID)

These are subscription perks, not in-app cosmetic purchases. v1 keeps the pricing model simple: one paywall, two billing periods.

### 11.3 Implementation

Use RevenueCat per `documentation/subscription-pattern.md`. Store API keys in ConfigCat per `documentation/configcat-pattern.md`. Track purchase events in PostHog per `documentation/posthog-pattern.md`.

## 12. Technical architecture

birdr inherits the engineering patterns documented in `documentation/`. Reuse without modification where possible.

### 12.1 Frontend

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation per `navigation-pattern.md` — four-tab bottom-tab navigator with stack navigators inside each tab
- Atomic design system per `atomic-design-pattern.md` and `atomic-design-extended-atoms.md`
- Haptic feedback per `haptic-feedback-pattern.md`
- Map rendering: a two-tier strategy (see §18.4) — static pre-rendered illustrated maps for per-card range maps; Mapbox or MapLibre with a custom style approximating the brand palette for interactive maps (Explore, global sightings, per-card sightings)

### 12.2 Backend

- Supabase (auth, Postgres, edge functions, storage)
- Edge function for bird ID per `EDGE-FUNCTION.md`
- Edge function for server-side streak validation
- Edge function for proxying eBird API calls (so the eBird API key isn't shipped to clients)
- User photo storage per `upload-pattern.md`

### 12.3 Services

- Sentry — error tracking (`sentry-pattern.md`)
- PostHog — product analytics (`posthog-pattern.md`)
- ConfigCat — feature flags and remote config (`configcat-pattern.md`)
- RevenueCat — subscriptions (`subscription-pattern.md`)
- **eBird API (Cornell Lab)** — recent observations near user and common species in region for the Explore tab. Requires API key + agreement; check commercial use terms.
- Cloud vision API (Gemini Flash or equivalent) — bird ID

### 12.4 Database schema (high level)

Server-side:

- `species` — curated bird DB, ~900 rows (includes `species_type` and `primary_habitat` enums from §7.2)
- `species_assets` — references to audio, illustrations, range maps
- `users` — Supabase auth users
- `customer_accounts` — backend customer records keyed by Supabase user_id
- `sightings` — every successful capture (user_id, species_id, photo_url, captured_at, lat, lon, named_location)
- `cards` — per-user-per-species aggregate (user_id, species_id, first_seen_at, last_seen_at, sighting_count, hero_photo_url)
- `streaks` — per-user (user_id, current_streak, longest_streak, last_capture_date)
- `achievements` — per-user (user_id, achievement_id, unlocked_at, progress)
- `ebird_cache` — short-TTL cache of eBird responses keyed by (lat_rounded, lon_rounded, query_type) to limit external API hits

A note on the schema: `sightings.lat/lon` should be stored as precise coordinates but a separate `display_location` field (named place, fuzzed location) should be added now even though v1 doesn't use it publicly. This avoids a painful migration when social features arrive in v2.

### 12.5 E2E testing

Maestro per `e2e-testing-pattern.md`. Critical flows to cover at launch:

- First-time signup → permission grants → first capture
- High-confidence capture creates a new card
- Low-confidence capture shows the top-3 picker
- Repeat capture of an existing species updates the sightings log
- Streak increments on first daily capture
- Streak resets after a missed day (with mocked time)
- Explore tab loads nearby observations (mocked eBird response)
- Subscription paywall and RevenueCat sandbox purchase
- Collection search and filter

## 13. Data sources and curation

### 13.1 Custom curated DB

The 900-species North American bird DB is the highest-effort pre-launch task. Strategy:

- Source common names, taxonomy, conservation status, size, and habitat from authoritative sources (eBird taxonomy, IUCN Red List, Cornell Lab Birds of the World)
- LLM-assisted drafts of "About" editorial copy, then human review for accuracy on every entry
- Audio from xeno-canto (CC-licensed bird recordings) — verify license compatibility per recording
- Range maps from BirdLife International or similar — license check required
- Manual QA pass on every species before launch; quality matters more than coverage

Estimated effort: 2–3 focused months for one person, less with assistance.

### 13.2 eBird API for the Explore tab

The Explore tab pulls live data from the eBird API:

- `recent observations nearby` (radius default ~25 km from user's current location)
- `common species in region` (subnational regions for the US)

eBird requires an API key and has terms of use that distinguish non-commercial from commercial use. The legal review for commercial use must happen before launch. If commercial terms are not workable, fall back options include: (a) iNaturalist's public observations API, (b) curated static "common species by state" data shipped with the app and updated periodically.

All eBird responses are cached server-side with a short TTL (e.g., 15–30 minutes) to control external API volume and stay within rate limits.

### 13.3 Range map asset pipeline

Each of the ~900 species needs a range map illustrated in the brand's field-guide aesthetic. Hand-illustrating 900 maps is prohibitive, so the pipeline is:

1. Hand-illustrate one base map of North America in the brand style (sage greens, golden west, blue water, thin state borders). Stored as a high-resolution SVG template.
2. For each species, fetch the range polygon from eBird, IUCN, or BirdLife International.
3. A scripted job overlays the range polygon onto the base map as a warm coral fill at ~60% opacity with feathered edges, exports the result as PNG (and SVG where feasible).
4. Generated assets are stored in Supabase storage and referenced by `species_assets.range_map_url`.

This produces one consistent base across all species while keeping the per-species generation tractable.

### 13.4 Asset hosting

Static assets (audio, range maps, illustrations, habitat backgrounds) hosted on Supabase storage with CDN. Avoid in-app bundling unless total size stays under ~50 MB.

## 14. Privacy and permissions

### 14.1 Permissions

- **Camera:** Required. Requested with a clear rationale on the permission prompt.
- **Photo Library:** Optional. For importing existing photos.
- **Location:** Required for v1. Requested as "When in Use," never "Always."
- **Notifications:** Optional, recommended for streak reminders and achievement unlocks.

### 14.2 Data handling

- User photos stored in Supabase storage, scoped to the user's account
- Precise GPS coordinates stored alongside each sighting (no fuzzing in v1 since nothing is publicly shared)
- App Privacy disclosures: "Precise Location," "Photos," "User Content"
- Account deletion flow per App Store requirements

### 14.3 Future-proofing for social

When v2 introduces social features, public-facing sighting locations must be fuzzed (round to nearest named place ≥1 km radius) to protect users from accidentally revealing home addresses. The schema should support both `precise_lat/lon` (private) and `display_location` (public, fuzzed) from v1.

## 15. Open questions

1. **Card "7" badge semantics:** Is it per-species sighting count, family-collector progress, or both layered? Confirm in design review.
2. **Audio button UX on card:** Single tap-to-play, or expandable selector for song/call/alarm-call?
3. **Card flip vs. detail screen:** Does the card flip to reveal a sightings log, or is the log a separate detail view?
4. **First Sight permanence:** Frozen forever, or editable?
5. **ID provider final pick:** Lock Gemini Flash or evaluate Merlin/iNat ToS for commercial use?
6. **Daily free ID limit (N):** Suggested 3/day — needs validation during beta
7. **Subscription pricing:** Weekly and yearly final prices — competitive analysis pending
8. **Onboarding length:** How many tutorial screens before dropping into the app?
9. **Notification defaults:** Default reminder time, user customization scope
10. **At the daily ID limit for free users:** Hard block + paywall, or a soft "preview" of what they would have caught?
11. **Explore radius default:** 25 km is a guess. Should users be able to adjust it? Does urban vs. rural location warrant different defaults?
12. **eBird commercial terms:** Confirm commercial-use viability before building Explore on top of it. Identify fallback if blocked.
13. **Capture tab when leaving viewfinder:** When the user navigates away from Capture mid-flow and returns, do they land on the viewfinder fresh, or resume where they left off?
14. **Explore "target species" save:** Should v1 include a "save as target" interaction on Explore species, or is that a v1.1 add?

## 16. Success metrics

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
- Explore tab engagement: % of weekly actives who open Explore at least once

## 17. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloud ID accuracy too low for casual users | M | H | Beta-test with real users before launch; consider Merlin/iNat fallback |
| Cloud ID cost balloons as usage scales | M | M | Tight free-tier limit; consider custom model if unit economics break |
| DB curation takes longer than expected | H | M | Start curation in parallel with engineering; LLM-assisted drafts |
| Strict streak drives churn after first reset | H | M | Plan "streak revive" reward in v1.1 |
| App Store rejection over location data | L | H | Conservative privacy disclosure; consider fuzzing earlier if Apple pushes back |
| Non-bird photos clutter the ID model | L | L | Confidence threshold + "try again" handles this naturally |
| NA-only DB feels limiting to global users | M | L | Geofence App Store to US for v1 (already planned) |
| eBird API commercial terms block Explore | L | H | Confirm terms early; have fallback (iNat or static data) ready |
| eBird API rate limits or downtime | M | M | Server-side caching with short TTL; degrade gracefully on outage |

## 18. Visual design language

The visual direction is "modern field guide" — warm, naturalist, illustrated, with the polish of a contemporary app but the personality of an old paper bird book. This aesthetic was established by the Cardinal card design and the illustrated North America map references.

### 18.1 Color palette

Drawn from the brand's map illustrations. All UI colors should derive from this palette:

| Role | Color | Approximate hex | Where it appears |
|---|---|---|---|
| Primary (brand) | Sage / moss green | ~#639922 / #3B6D11 | Tab active state, primary buttons, key headers, map land fills |
| Accent gold | Saffron / amber yellow | ~#EF9F27 / #FAC775 | Card frame for LC rarity, streak chip, highlights, capture button |
| Warm accent | Coral / terracotta | ~#D85A30 / #993C1D | Range map overlays, EN/CR rarity frames, streak flame, urgent CTAs |
| Cool secondary | Robin-egg sky blue | ~#85B7EB / #B5D4F4 | Water on maps, info accents, gentle backgrounds |
| Surface | Cream / off-white | ~#FAF7F0 | Page backgrounds, card body fills |
| Text primary | Deep charcoal | ~#2C2C2A | Body text, titles |
| Text secondary | Warm gray | ~#5F5E5A | Captions, helper text |

Hex codes are anchors, not final tokens. The production design system will lock exact values once dark-mode variants and accessibility contrast checks are done.

### 18.2 Card frame rarity system

Conservation status drives the card's border color. Each tier ties to one swatch in the palette:

| IUCN | Frame color |
|---|---|
| LC (Least Concern) | Saffron yellow (current Cardinal example) |
| NT (Near Threatened) | Light orange |
| VU (Vulnerable) | Coral |
| EN (Endangered) | Deep terracotta |
| CR (Critically Endangered) | Burgundy / deep red |

Rare-tier cards should also surface the protection framing (link to conservation info) so the visual rarity reads as reverence, not trophy.

### 18.3 Map aesthetic and strategy

Per the map references, the aesthetic is illustrated/watercolor with sage and gold terrain, sky-blue water, and coral range overlays. The product has three map use cases with different feasibility profiles, so v1 uses a two-tier strategy:

**Tier 1 — Static illustrated maps (full aesthetic)**

- Per-card range maps. One per species, generated via the asset pipeline in §13.3.
- Why static: the field-guide watercolor feel doesn't survive arbitrary zoom/pan. Static images keep the aesthetic perfect at the one zoom level that matters.

**Tier 2 — Custom-styled interactive maps (palette only)**

- Explore tab map (nearby observations from eBird)
- Per-card personal sightings map (where the user has spotted this species)
- Global sightings map (in Profile)
- Implementation: Mapbox GL or MapLibre with a custom style tuned to the brand palette. Land = sage gradient, water = robin-egg, pins = coral. No roads, no labels except major place names.
- Why this trade-off: maintaining hand-painted watercolor at every zoom level across all of North America is prohibitive. The custom style gets us 80% of the aesthetic at 20% of the cost.

### 18.4 Typography (working direction)

A friendly geometric sans for UI and body, with a slightly editorial display sans for card titles and big numbers. Concrete recommendations to validate:

- UI / body: Inter, DM Sans, or Söhne — neutral, modern, highly legible at small sizes
- Card titles ("Cardinal"): a slightly weightier display sans like Söhne Breit, Söhne, or a custom treatment
- Numerals: tabular figures for stats and timers (Inter and DM Sans both have these)
- No serif in v1 — saves a font load and avoids a "vintage taxidermy" feel

Two weights, semibold for headings, regular for body. (Following the existing atomic design pattern docs.)

### 18.5 Iconography

Outline-style icons throughout (matching the binoculars-icon direction for the Capture tab). Candidate icon sets:

- Tabler (5800+ outline icons, generous license)
- Lucide (clean, modern, well-maintained)
- Phosphor (multiple weights, very designer-friendly)

The four tab icons (Capture, Collection, Explore, Profile) and the conservation-status badges may warrant a custom-drawn pass for personality.

### 18.6 Habitat footer illustrations

Nine habitat scenes (forest, grassland, desert, wetland, freshwater, coast, mountain, tundra, urban) are needed for the card footer backgrounds. Owner will provide finished art. Style direction: same watercolor field-guide aesthetic as the maps, simplified to read at small sizes on the card.

---

**Next steps**

1. Resolve the open questions in §15 (especially the card "7" badge, ID provider pick, and eBird commercial terms)
2. Begin DB curation work in parallel with engineering scaffolding
3. Stand up the Supabase project (auth, schema migration, edge function stubs for ID + eBird proxy)
4. Build the capture → ID → card vertical slice as the first engineering milestone
5. Wire up the Explore tab with eBird as the second milestone
6. Beta test with 20–50 casual bird watchers before public launch
