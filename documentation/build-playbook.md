# birdr Build Playbook

Step-by-step execution plan with git worktree commands and Claude Code prompts for each wave. Run from the `birdr/` directory (main worktree).

---

## Wave 1 — Foundation (3 parallel streams)

### Setup

```bash
git worktree add ../birdr-supabase-init feat/supabase-init
git worktree add ../birdr-app-scaffold feat/app-scaffold
git worktree add ../birdr-hydration feat/species-hydration
```

Open three terminals. One per directory. Start Claude Code in each.

### Terminal 1 — Supabase project init

```bash
cd ../birdr-supabase-init
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §12.2 and §12.4).

Initialize the Supabase project for birdr:

1. Install the Supabase CLI and initialize a new project in this repo
2. Configure auth providers: Apple OAuth and Google OAuth. No email/password.
3. Create Supabase storage buckets:
   - "photos" — for user-uploaded bird photos (private, scoped per user)
   - "species-assets" — for species audio, illustrations (public, read-only)
4. Set up the local development environment (supabase start, local config)
5. Document the required environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

Do not create database tables yet — that's a separate stream. Do not work on the mobile app. Focus only on Supabase project setup, auth config, and storage.
```

### Terminal 2 — Expo app scaffold

```bash
cd ../birdr-app-scaffold
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §5 for information architecture and §12.1 for frontend stack). Also read documentation/atomic-design-pattern.md and documentation/navigation-pattern.md.

Initialize the Expo app in app/:

1. Run expo init with TypeScript template (managed workflow)
2. Install and configure React Navigation with the four-tab bottom navigator:
   - Capture (default tab, binoculars icon)
   - Collection (book icon)
   - Explore (compass icon)
   - Profile (user icon)
   Each tab should have its own stack navigator.
3. Create placeholder screens for each tab with testIDs
4. Set up the provider hierarchy in this order:
   GestureHandlerRootView > NavigationProvider > PostHog > Auth (stub) > RevenueCat (stub) > HapticFeedback > App
   Auth and RevenueCat providers can be stubs for now — just the context shape with no real implementation.
5. Install and configure Plus Jakarta Sans fonts (Regular 400, Medium 500) with tabular figures
6. Install Lucide React Native for icons
7. Set up the theme file (src/theme/index.tsx) with placeholder design tokens — use the birdr palette anchors from PRD §18.1 (sage, saffron, coral, robin-egg, cream, charcoal) but note these are not final
8. Create the atomic design folder structure: src/components/atoms/, molecules/, organisms/
9. Install react-native-true-sheet (@lodev09/react-native-true-sheet)
10. Install react-native-reanimated and add the babel plugin

Do not implement any screens beyond placeholders. Do not connect to Supabase. Do not work on edge functions or the species database.
```

### Terminal 3 — Species hydration script

```bash
cd ../birdr-hydration
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §12.4 for the database schema and §13.1-13.2 for the curation pipeline).

Build a species database hydration script in scripts/:

STEP 1 — Taxonomy hydration:
1. Download the eBird/Clements taxonomy CSV from the Clements Checklist website
2. Parse it and filter to ~900 North American bird species
3. Download the IUCN Red List conservation status data and join on scientific name
4. Output SQL INSERT statements for the species table (common_name, scientific_name, family, order, conservation_status). Leave species_type_id, primary_habitat_id, about_text, distinguishing_feature, and size as NULL for now.

STEP 2 — Regional data hydration:
1. Download bar chart frequency data for all 50 US states from eBird's website (predictable URLs, use polite delays between requests)
2. Parse the TSV files — extract detection frequency per species per week-of-year
3. Classify each species-state pair into a season enum: year_round, summer, winter, migratory, or rare (based on >5% frequency threshold per season)
4. Extract peak frequency value per species per state
5. Output SQL INSERT statements for the species_regions table (species_id matched by scientific name, region_code like "US-NC", season, frequency)

STEP 3 — Lookup table seeds:
1. Output SQL INSERT statements for species_types (9 rows: Songbird, Waterfowl, Birds of prey, Shorebird, Seabird, Woodpecker, Game bird, Aerial specialist, Hummingbird)
2. Output SQL INSERT statements for habitats (9 rows: Forest, Grassland, Desert, Wetland, Freshwater, Coast, Mountain, Tundra, Urban)

STEP 4 — LLM batch curation template:
1. Create a script that takes the species list from Step 1 and generates a structured prompt per species for batch processing
2. Each prompt should request JSON output with: species_type (one of the 9 types), primary_habitat (one of the 9 habitats), size (inches), about_text (2-3 sentences for casual birders, no jargon), distinguishing_feature (5-8 words, visible field marks)
3. Include a post-processing script that takes the LLM JSON responses and generates SQL UPDATE statements to fill in the NULL fields on species rows, mapping species_type and primary_habitat strings to the lookup table UUIDs

Use Python or Deno. Output all SQL to a seeds/ directory as numbered migration files. Do not work on the mobile app or edge functions.
```

### Wave 1 merge

When all three terminals finish:

```bash
cd /Users/brandonhafenrichter/Projects/birdr
git merge feat/supabase-init
git merge feat/app-scaffold
git merge feat/species-hydration
git worktree remove ../birdr-supabase-init
git worktree remove ../birdr-app-scaffold
git worktree remove ../birdr-hydration
```

---

## Wave 2 — Schema + data (sequential)

### Stream D — Database schema

```bash
git checkout -b feat/db-schema
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §12.2 for auth architecture and §12.4 for the full database schema).

Create the Supabase database schema as a migration file:

1. Create all tables per §12.4:
   - species_types (id uuid PK, name text unique)
   - habitats (id uuid PK, name text unique)
   - species (id, common_name, scientific_name, family, order, species_type_id FK, primary_habitat_id FK, conservation_status enum, about_text, distinguishing_feature, size)
   - species_audio (id, species_id FK, storage_path, label)
   - species_regions (species_id + region_code composite PK, season enum, frequency float)
   - species_illustrations (id, species_id FK, storage_path, variant)
   - profiles (id = auth.users.id, display_name, created_at, ids_used_today, last_quota_reset_date, is_onboarded boolean)
   - sightings (id, user_id FK, species_id FK, photo_storage_path, captured_at, lat, lon, named_location, display_location)
   - streaks (user_id PK FK, current_streak, longest_streak, last_capture_date, total_capture_days)
   - user_achievements (id, user_id FK, achievement_id text, progress float, unlocked_at timestamptz nullable)

2. Create the cards view per §12.4 (DISTINCT ON for hero photo from earliest sighting)

3. Create all indexes per the index summary in §12.4:
   - species: species_type_id, primary_habitat_id
   - species_audio: species_id
   - species_regions: (region_code, season)
   - species_illustrations: species_id
   - sightings: (user_id, species_id, captured_at ASC), (user_id, captured_at DESC)
   - user_achievements: unique (user_id, achievement_id), partial (user_id, unlocked_at DESC) WHERE unlocked_at IS NOT NULL

4. Create the handle_new_user() trigger function per §12.2 that fires on auth.users INSERT and creates profiles + streaks rows

5. Create RLS policies:
   - profiles: users can read/update their own row only
   - sightings: users can read/insert their own rows only
   - streaks: users can read their own row only (updates via edge functions)
   - user_achievements: users can read their own rows only (updates via edge functions)
   - species, species_types, habitats, species_audio, species_regions, species_illustrations: public read for all authenticated users

6. Create the conservation_status enum type and the season enum type

Write this as a Supabase migration file. Do not work on the mobile app or edge functions.
```

### Stream E — Seed species data

After D merges:

```bash
git checkout -b feat/species-seed
claude
```

Prompt:

```
Read CLAUDE.md and the hydration scripts in scripts/ (created in Wave 1).

Run the species database hydration pipeline:

1. Run the taxonomy hydration script to generate seed SQL for species_types, habitats, and species tables
2. Run the regional data hydration script to generate seed SQL for species_regions
3. Apply all seed files to the Supabase database via migration or seed command
4. Verify the data: check row counts (species ~900, species_regions ~45k, species_types = 9, habitats = 9)
5. Run the LLM batch curation script to generate about_text, distinguishing_feature, size, species_type, and primary_habitat for all species
6. Apply the LLM-generated UPDATE statements to fill in the NULL fields
7. Verify: spot-check 10-20 species for accuracy of LLM-generated content

Do not work on the mobile app or edge functions.
```

---

## Wave 3 — Edge functions + auth (2 parallel streams)

### Setup

```bash
git worktree add ../birdr-edge-functions feat/edge-functions
git worktree add ../birdr-auth-flow feat/auth-flow
```

### Terminal 1 — Edge functions

```bash
cd ../birdr-edge-functions
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §12.2 for all edge function specs, including the auth pattern, IoC provider architecture, and each function's step-by-step logic).

Implement all 4 Supabase Edge Functions in functions/:

1. identify-bird (§12.2):
   - Extract user from JWT (auth pattern from §12.2)
   - Quota check against profiles.ids_used_today (reset if new day, return 402 if free user >= 3)
   - Implement the BirdIdProvider IoC interface and the GPT-4o adapter (provider-factory reads BIRD_ID_PROVIDER env var)
   - The GPT-4o adapter should send the image + location context and request structured JSON with species candidates + confidence scores
   - Implement matchSpecies() utility to map returned species names to our species table (exact match on common_name, scientific name fallback)
   - Apply confidence thresholds: >=85% auto_accepted, 60-85% pick (top 3), <60% retry
   - Accept image as multipart form data

2. confirm-sighting (§12.2):
   - Extract user from JWT
   - Validate species_id exists, photo_storage_path exists in storage
   - Insert sighting row
   - Check if First Sight (no prior sightings for this user + species)
   - Update streak (lazy logic: same day = no-op, yesterday = increment, older = reset to 1)
   - Evaluate achievements scoped to what changed (streak tiers always; collection milestones + family + habitat mastery only on First Sight)
   - Upsert user_achievements with COALESCE on unlocked_at
   - Wrap sighting + streak in a transaction; achievements after commit
   - Return full response with sighting_id, is_first_sight, species, streak, achievements_unlocked

3. explore-species (§12.2):
   - Extract user from JWT
   - Resolve lat/lon to US state code (point-in-polygon against a lightweight state boundary dataset)
   - Query species_regions joined to species and user's cards view
   - Return shaped response with region_label, season_label, species list (ordered: unspotted first, then by frequency DESC)

4. delete-account (§12.2):
   - Extract user from JWT
   - Delete user photos from storage
   - Delete from user_achievements, sightings, streaks, profiles (FK order)
   - Delete auth user via supabase.auth.admin.deleteUser() (requires SUPABASE_SERVICE_ROLE_KEY)
   - Return { success: true }

Each function should follow the Deno edge function pattern from documentation/EDGE-FUNCTION.md. Set up proper error handling and HTTP status codes per the specs.
```

### Terminal 2 — Auth flow

```bash
cd ../birdr-auth-flow
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §6.1 for the full onboarding spec, §12.2 for auth architecture). Also read documentation/authentication-pattern.md for the Supabase auth pattern.

Implement the authentication flow in the app:

1. Auth context (src/contexts/auth.tsx):
   - Initialize Supabase client with AsyncStorage persistence
   - Listen for auth state changes
   - Fetch profile from profiles table on session change
   - Expose: session, user, profile, loading, isOnboarded, signInWithApple, signInWithGoogle, signOut, completeOnboarding
   - completeOnboarding sets profiles.is_onboarded = true

2. Conditional navigation in RootNavigator:
   - No session → Onboarding stack
   - Session + not onboarded → Permissions + tutorial flow
   - Session + onboarded → Main tab navigator

3. Onboarding screens:
   - Splash screen (~1s brand moment)
   - Welcome carousel (3 slides per §6.1, skippable)
   - Sign-in screen with Apple and Google OAuth buttons
   - Permission rationale screen: Camera (required), Location (required), Notifications (optional) — per §6.1 step 4
   - Permission denied recovery sheets with "Open Settings" deep-link
   - Tutorial capture screen (pre-staged sample Cardinal, skippable, "Sample" badge, not saved to real collection) — this can be a simplified mock for now

4. Every component must have a testID per the atomic design pattern.

5. Wire up PostHog identification after successful sign-in (set user ID).

Do not implement edge functions, database schema, or the capture flow. Focus only on auth and onboarding.
```

### Wave 3 merge

```bash
cd /Users/brandonhafenrichter/Projects/birdr
git merge feat/edge-functions
git merge feat/auth-flow
git worktree remove ../birdr-edge-functions
git worktree remove ../birdr-auth-flow
```

---

## Wave 4 — The vertical slice (single stream, critical path)

```bash
git checkout -b feat/capture-flow
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §5.2, §6.2, §6.7, §6.8, §6.13, §6.14, §6.15, §10.7, and §12.2).

Build the complete capture → ID → card flow end-to-end:

1. Capture hub screen (§5.2):
   - Streak chip (current streak count)
   - Today's capture status ("Capture today to keep your streak" / "Streak safe")
   - Daily ID quota indicator for free users ("2 of 3 captures left")
   - Recent captures strip (from sightings, last 3-5)
   - Large central capture button (saffron, launches camera)

2. Camera viewfinder (§6.13):
   - Fullscreen modal, tab bar hidden, X close in top corner
   - Live camera feed
   - Daily quota chip top-right
   - Shutter button bottom-center
   - Camera permission denied recovery (bottom sheet with Open Settings deep-link)

3. Photo preview (§6.14):
   - Full-bleed captured photo
   - "Retake" (left) and "Identify" (right) buttons
   - Retake returns to viewfinder, Identify calls the identify-bird edge function

4. Identify flow:
   - Send image bytes + lat/lon to identify-bird edge function
   - Handle 402 quota_exceeded → show hard paywall (subscription screen as fullscreen modal)
   - On result "auto_accepted" → proceed to card reveal
   - On result "pick" → show top-3 picker (§6.8)
   - On result "retry" → show "try again" with guidance text, return to viewfinder

5. Top-3 candidate picker (§6.8):
   - User's photo at top (~30% height)
   - "Pick the bird you spotted" heading
   - 3 candidate rows (illustration, name, distinguishing_feature, "Most likely" pill on top candidate)
   - "None of these match" at bottom → return to viewfinder

6. After species confirmed:
   - Upload photo to Supabase storage ("photos" bucket)
   - Call confirm-sighting edge function with species_id, photo_storage_path, lat, lon, named_location, captured_at, timezone
   - Use the response to drive animations

7. Card unlock reveal (§6.7) — for First Sight only:
   - 5-beat animation: Identifying → Match found → Card materializes → First Sight banner → Settled state
   - Rarity-scaled intensity (particle count, color, haptics) based on conservation_status
   - Use Reanimated for card transforms, Lottie for particles (placeholder Lottie files for now)
   - Haptic feedback per documentation/haptic-feedback-pattern.md
   - Respect Reduce Motion setting
   - Settled state shows streak increment + achievements_unlocked chips
   - "Continue" (back to viewfinder) and "View card" CTAs

8. For repeat sightings: "Spotted again!" toast, return to viewfinder

9. Achievement celebration queue (§10.7):
   - After card reveal settles, play achievement celebrations sequentially
   - Each: dark background, particle burst in category color, badge, name, description, "Next:" teaser
   - Tap to dismiss, queue advances
   - Priority order: Master > Expert > Adept > Apprentice > Spotter, then collection, then streak

10. App store rating prompt (§6.15):
    - Track first_sight_count locally
    - Every 3rd First Sight, after celebrations finish, call native store review API

Every component must have a testID. Use the atomic design system from src/components/. This is the most important milestone — the entire product loop.
```

---

## Wave 5 — Remaining features (3 parallel streams)

### Setup

```bash
git worktree add ../birdr-collection feat/collection
git worktree add ../birdr-explore feat/explore
git worktree add ../birdr-profile feat/profile
```

### Terminal 1 — Collection

```bash
cd ../birdr-collection
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §6.3 for collection grid and §6.9 for card detail).

Build the Collection tab:

1. Collection grid — Spotted view (default, §6.3):
   - Grid of card thumbnails (3 columns), bird photo + species name + sighting count badge
   - Default sort: most recently spotted
   - Section headers by capture recency
   - Search bar filters by species name
   - Filter chips: Species type, Habitat, Conservation status, Date range
   - Sort menu: Recently spotted, Alphabetical, Conservation rarity, Family

2. Collection grid — All North America view (§6.3):
   - Full catalog of 900 species
   - Spotted species as normal thumbnails, unspotted as locked silhouettes
   - Grouped by habitat with per-group progress headers
   - Collapsible sections

3. Card detail screen (§6.9):
   - The bird card (frame color by rarity, taxonomy tag, habitat pill (informational only in v1), hero photo, About copy, First Sight metadata, conservation badge, sighting count)
   - Quick stats trio (sightings, first spotted, last spotted)
   - Recent sightings list (2-3 entries, "View all" link)
   - Personal sightings map (Mapbox/MapLibre with coral pins)

4. Full sightings log screen
5. Per-species sightings map (fullscreen)

6. Empty state for new users (no captures yet): illustration + "Photograph your first bird" CTA

Query data from the cards view and sightings table via Supabase client. Every component must have a testID.
```

### Terminal 2 — Explore

```bash
cd ../birdr-explore
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §6.4 for the Explore tab spec and §12.2 for the explore-species edge function).

Build the Explore tab:

1. Segmented control: Near me (default), My map

2. Near me mode:
   - Call explore-species edge function with user's lat/lon and mode "near_me"
   - Contextual header: "[Season] near [Location] · [N] species expected"
   - Species rows: reference illustration (placeholder if no illustration), species name, species type, season tag (Year-round / Summer only / Winter visitor), spotted status (sage check vs gray "Not yet")
   - Order: unspotted first, then by frequency descending
   - Filter icon: species type filter, season toggle


   - Contextual header: "Common in [State] · [N] species"

4. My map mode:
   - User's personal sightings on an interactive Mapbox/MapLibre map
   - Stats trio: Captures / Species / States
   - Coral pins for each sighting, clusters when zoomed out
   - Tap pin → sighting preview (date, location, photo, deep-link to card detail)
   - Empty state for new users

5. Species preview modal:
   - Triggered by tapping a row in Near me
   - Bottom sheet with species illustration, name, type, habitat, season, About copy
   - "View my card" if spotted, "Close" if not

6. Error/empty states per §6.4

Every component must have a testID. Request location permission if not already granted.
```

### Terminal 3 — Profile

```bash
cd ../birdr-profile
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md (especially §6.5, §6.6, §6.10, §6.11, §6.12, §10, and §11).

Build the Profile tab and related screens:

1. Profile home (§6.10):
   - Identity block (avatar from OAuth + display name + "Birding since [date]")
   - Stats trio (Species count, Streak count, Captures count)
   - Subscription banner (saffron upgrade card for free users) / manage row for subscribers
   - Activity rows: Achievements, Streak history, Sightings map
   - Support rows: Help & FAQ, Send feedback, About/Privacy/Terms
   - Sign out button
   - Delete account button (destructive, at bottom)

2. Achievements hub (§10.6):
   - Overall progress card (total unlocked / total)
   - Recently unlocked list (1-3 most recent)
   - 4 category cards (Collection, Streaks, Family masters, Habitat masters) with progress bars in category accent colors (sage, coral, purple, teal)

3. Achievement section detail:
   - List sorted: in-progress, locked, unlocked
   - Inline expansion on tap (name, description, criteria, related achievements)

4. Streak detail (§6.6):
   - Current streak (large, coral-tinted)
   - Longest streak (stat tile)
   - Capture days total (stat tile)
   - 60-day calendar grid (highlighted capture days from sightings query)
   - Dynamic prompt: "Capture today to keep it going" / "Streak safe"

5. Subscription screen + hard paywall (§6.12, §11):
   - RevenueCat integration per documentation/subscription-pattern.md
   - Two tiers: Weekly $3.99, Yearly $29.99
   - Feature comparison for free users
   - Manage/restore for subscribers
   - Hard paywall mode: same content as fullscreen modal, triggered when identify-bird returns 402

6. Delete account flow (§6.11):
   - Bottom sheet via react-native-true-sheet
   - Step 1: warning text + Cancel/Continue
   - Step 2: "Type DELETE to confirm" input, disabled button until match
   - On confirm: call delete-account edge function, sign out, return to welcome

Every component must have a testID.
```

### Wave 5 merge

```bash
cd /Users/brandonhafenrichter/Projects/birdr
git merge feat/collection
git merge feat/explore
git merge feat/profile
git worktree remove ../birdr-collection
git worktree remove ../birdr-explore
git worktree remove ../birdr-profile
```

---

## Wave 6 — Polish (sequential)

```bash
git checkout -b feat/polish
claude
```

Prompt:

```
Read CLAUDE.md and documentation/product-requirements.md.

Polish pass across the app:

1. Push notifications:
   - Streak reminder at 6pm local if no capture yet today
   - Achievement unlock notifications when app is backgrounded

2. Reduced motion variants:
   - Card unlock reveal: particles collapse to static accent, card cross-fades instead of animating
   - Achievement celebration: badge cross-fades, no particles

3. App store rating prompt: verify it fires every 3rd First Sight after celebrations

4. Error states: verify all edge function error responses show user-friendly messages

5. Loading states: verify all async operations show appropriate loading indicators

6. Haptic feedback: verify all interactive elements have appropriate haptic responses per documentation/haptic-feedback-pattern.md

Do not add features beyond what's in the PRD. This is polish only.
```

---

## Quick reference — merge order

```
Wave 1: feat/supabase-init + feat/app-scaffold + feat/species-hydration → main
Wave 2: feat/db-schema → main, then feat/species-seed → main
Wave 3: feat/edge-functions + feat/auth-flow → main
Wave 4: feat/capture-flow → main
Wave 5: feat/collection + feat/explore + feat/profile → main
Wave 6: feat/polish → main
```
