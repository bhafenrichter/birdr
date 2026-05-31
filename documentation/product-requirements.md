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
- Card content: species data + user's photo + first-sight metadata + conservation status badge (bird call audio and range map deferred from v1)
- Collection browser: grid view, search by name, filter by family/habitat/conservation status, sort by date/name/rarity
- Explore surface: research-based "Near me" list of species expected in the user's area (powered by curated DB), plus personal global sightings map ("My map"). No real-time crowdsourced data in v1 — that's a v1.1 layer.
- Daily streak tracker (strict: miss a day, reset)
- Achievement system across five categories: collection milestones, streak tiers, regional/geographic, family/category masters, and habitat masters. Mastery categories use a five-tier exponential progression (Spotter/Apprentice/Adept/Expert/Master) for accessibility.
- Free tier with 3 daily ID attempts; Weekly ($3.99) and Yearly ($29.99) subscriptions to remove the cap (no free trial in v1)
- North American species coverage (~900 species curated)
- US-only launch (App Store + Play Store, US storefronts)

Out of scope for v1 — planned for later releases:

- **Audio-based identification** (record a bird call → AI identifies it). Deferred to v2.
- **Manual species search from the top-3 picker** ("I think it's a..." search box when none of the three candidates match). v1.1 candidate.
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

The app opens to the Capture tab — a **minimal, focused launch screen**, not the camera. The hub shows the birdr wordmark, a large central capture button, and a short tagline. Tapping the capture button launches the camera as a separate fullscreen screen (with the tab bar hidden).

The design is intentionally stripped down — no stats, no streak chip, no collection progress, no recent captures. The capture button is the single affordance. This keeps the first impression clean and puts all focus on the core action.

Exception: First-time users land on the welcome carousel and tutorial flow, then drop into the Capture hub.

### 5.3 Screen inventory by tab

**Capture tab (~2 screens) and capture flow (~5 screens)**

The Capture tab itself:

- Capture hub (default for the tab) — birdr wordmark + notification bell top row, large central teal capture button with subtle pulse animation, "Find a bird" headline + tagline below. Minimal by design — no stats, no streak, no recents.

The capture flow, launched from the hub's central button as a fullscreen modal experience without the tab bar:

- Camera viewfinder (fullscreen, tab bar hidden; X close, daily quota chip, flash toggle, zoom pills 1×/2×/3×, shutter — see §6.13)
- Camera permission denied recovery (bottom sheet with "Open Settings" deep-link — see §6.13)
- Photo preview + "Identify" CTA (full-bleed photo, Retake/Identify actions — see §6.14)
- Identifying (loading; first beat of card unlock reveal — see §6.7)
- ID result: new species card created (full-screen celebration — see §6.7)
- ID result: existing species sighting added (toast + brief animation, returns to viewfinder)
- ID result: top-3 picker (low confidence — see §6.8)
- ID result: try again (very low confidence, with photo guidance)

Closing the capture flow (X in the top corner, or back gesture) returns the user to the Capture hub with the tab bar restored.

**Collection tab (~9 screens)**

- Collection grid — Spotted view (default; chronological sections)
- Collection grid — All North America view (habitat-grouped Pokédex)
- Search results
- Filter sheet (bottom sheet — Species type, Habitat, Conservation status, Date range)
- Sort menu
- Card detail (single scrollable screen; spotted version with user data)
- Card detail (single scrollable screen; unspotted/locked version with canonical info)
- Full sightings log (all entries for a species)
- Per-species sightings map (full-screen interactive map)

**Explore tab (~3 screens)**

- Near me (default) — location selector + research-based list of species expected in the user's area, with spotted/not-yet status overlay
- My map — the user's personal sightings on the brand-styled interactive map
- Species preview (modal) — tap any species row to see a preview with species info and sighting status

Two modes only (Near me + My map). Region mode removed from v1. No real-time crowdsourced observation feed — all data served from our own `species_regions` table.

The Explore tab does *not* include hotspots or "save as target" in v1 (both deferred to v1.1+).

**Profile tab (~5 screens)**

- Profile home (single combined screen: identity, stats trio, subscription banner/row, activity links, support links, sign out, delete account)
- Subscription screen (current plan + tier picker + features for free users; manage / restore for subscribers)
- Hard paywall (same content as Subscription screen but presented as a fullscreen modal when a free user hits the daily ID limit)
- Achievements hub (hero progress card + Unlocked/In progress sections with icon-left, progress-right rows)
- Delete account confirmation (two-step destructive flow via bottom sheet)
- Help & FAQ / Send feedback / About-Privacy-Terms (web view or simple content screen)

Notification preferences, account settings (password change, email), and app preferences (haptics, units, appearance) are out of scope for v1. v1 ships with fixed sensible defaults — see §6.10 for the list.

**Onboarding & system modals**

- Splash (~1s brand moment on first launch and cold app starts)
- Welcome carousel (first-launch only; 3 slides; skippable)
- Sign in (OAuth only — Apple, Google)
- Permission rationale + sequential OS prompts (Camera, Location, Notifications)
- Permission denied recovery sheets (deep-link to Settings)
- Tutorial capture (first-time only; pre-staged sample bird; skippable; tutorial card carries a "Sample" badge and is not saved)
- Hard paywall (triggered when a free user hits the daily ID limit; see §6.12)
- Achievement unlock celebration overlay (see §10.7)

Total: roughly 30 distinct screens / states across the four tabs and system modals. Sized correctly for a focused v1.

### 5.4 Design rationale

- **Capture as a tab, not a FAB.** Photography is the primary action, not a secondary feature. Putting it in the tab bar commits to that positioning.
- **Capture hub, not the camera directly.** Opening to a live camera every time is jarring. The hub signals "you're about to start a focused activity" before the lens turns on. Kept deliberately minimal — just the capture button — so the focus is on the action, not stats.
- **Camera as a fullscreen modal without the tab bar.** Hiding the tabs during capture creates a focus mode — visually and ergonomically, the user knows they're in a different state.
- **Collection separate from Capture.** Browsing your collection is a contemplative mode, distinct from the "I want to shoot something right now" intent of Capture. Mixing them dilutes both.
- **Explore as a dedicated tab.** Discovery (what's nearby? what should I look for?) is a different mode from capture or browsing. eBird's "recent observations" API gives this surface real, fresh data without requiring birdr to build a community.
- **Profile absorbs Achievements + Settings.** Achievements and streaks are personal stats; they live with the user's other personal context. Saves a tab and avoids splitting the "me" surface area.

### 5.5 Capture hub content (v1)

The Capture hub is intentionally minimal — the capture button is the only affordance.

1. **Top row** — birdr wordmark (left) + notification bell (right)
2. **Central capture button** — large circular teal button with sage gradient fill, binoculars icon, subtle radial pulse animation and dashed ring
3. **Bottom copy** — "Find a bird" headline + short tagline ("Tap the binoculars to take a photo — birdr will tell you what you've spotted.")

No streak chip, no daily quota indicator, no recent captures strip, no collection progress. These stats live in Profile and Collection. The hub is pure intent — "I want to find a bird."

Out of scope for v1 hub (candidates for v1.1+): bird-of-the-day, weather/conditions, target species suggestions, recent captures strip.

## 6. Core user flows

### 6.1 First-time user onboarding

Eight screens, designed to get a new user to their first card unlock in under 3 minutes. The welcome carousel and tutorial are both skippable. Permissions are required. See `documentation/design/screens-onboarding.jsx` for the design reference.

**1. Splash.** Brand moment — sage/teal gradient background with concentric rings, birdr wordmark (52px, ExtraBold), binoculars icon in a frosted rounded-square, tagline "a field guide that grows." Auto-advances after ~1 second.

**2. Welcome · Identify (slide 1 of 3).** Hero visual: camera-style framing on a sample bird with an inline "Northern Cardinal · 97% match" identification banner. Accent label (saffronDeep): "INSTANT IDENTIFICATION". Headline: "Identify any bird you spot." Sub copy describes the AI identification + species info. Skip top-right. Pagination dots + Next button bottom.

**3. Welcome · Collect (slide 2 of 3).** Hero visual: fanned stack of collectible bird cards (Cardinal style). Accent label: "YOUR COLLECTION". Headline: "Unlock a card for every species." Sub copy about building a personal aviary.

**4. Welcome · Achievements (slide 3 of 3).** Hero visual: full-width achievement rows (achievement earned + family progress + regional), matching the card-unlock layout. Accent label: "ACHIEVEMENTS". Headline: "Achievements that pull you outside." Sub copy about collection milestones and mastery tiers. "Get started" button replaces "Next."

**5. Sign in** — Hero section: sage-gradient binoculars icon in rounded-square with two card-thumb peeks rotated on either side. Accent label, headline "Welcome to birdr", sub copy. OAuth buttons:

- **"Continue with Apple"** — dark button, Apple branding. Required by Apple App Store policy.
- **"Continue with Google"** — outline button, Google branding.

No email/password in v1. Terms and Privacy Policy links at the bottom.

**6. Permissions** — single rationale screen with check toggles on each row. Camera + Location pre-checked (sage gradient fill, sage border on row). Notifications unchecked (outline). Three rows:

- **Camera (required)** — sage accent, pre-checked. "So you can photograph birds for identification."
- **Location (required)** — sky accent, pre-checked. "To record where you spotted each bird."
- **Notifications (optional)** — coral accent, unchecked. "Streak reminders and achievement alerts."

Helper copy: "Tap each permission to grant access." Primary sage gradient "Continue" button triggers OS prompts in sequence.

**Denied permission handling:**

- *Camera denied*: app remains usable; the Capture button on the hub surfaces a "Camera access needed" sheet with an "Open Settings" deep-link button.
- *Location denied*: app remains usable; sightings recorded without location metadata, Explore tab shows "Location needed" prompt with Settings deep-link.
- *Notifications denied*: app fully functional; no streak reminders or unlock notifications.

**7. Tutorial · Try it out (skippable)** — sample Cardinal photo displayed with a "SAMPLE" badge. "Try it out" header. Big sage primary "Identify" button. Tapping it runs the identify → reveal animation using sample data. Skip available top-right.

**8. Tutorial · Reveal** — the card unlock animation plays on the sample Cardinal. "Sample" tag rotated on the card. Below the card: two achievement rows matching the real unlock layout ("+1 day streak" + "First Feather"). "Start birding" CTA drops into the Capture hub. The tutorial card is NOT added to the user's real collection.

**Total time** — under 90 seconds for a user who skips carousel and tutorial. Under 3 minutes for a user who watches everything.

**Returning users.** None of steps 2–8 fire for returning users. The app launches straight to the Capture hub. Controlled by `profiles.is_onboarded`.

### 6.2 Capture → ID → Card

1. User is on the Capture tab (the hub) — sees the birdr wordmark and a large central capture button
2. User taps the central capture button → the camera launches as a fullscreen modal screen (tab bar hidden, X close in top corner)
3. Camera viewfinder is live; user takes a photo or selects from gallery
4. Preview screen with an "Identify" button
5. Upload to backend edge function with image + location
6. Backend calls cloud vision API, returns ranked species candidates with confidence scores
7. Branch on top-candidate confidence:
   - **≥85%:** Auto-accept, show card creation animation
   - **60–85%:** Show top-3 candidate picker (see §6.8); user selects correct species
   - **<60%:** Show "Try again" with photo guidance (lighting, framing, get closer)
8. On successful ID:
   - **New species:** Card is created with a celebratory "First Sight!" animation, then user can dismiss back to the Capture hub or open the full card
   - **Existing species:** Sighting count increments, new location added to per-card map, short toast "Spotted again!" — returns to viewfinder ready for the next shot
9. Streak counter updates if this is the first successful capture of the day
10. Closing the capture flow (X) returns to the Capture hub with the streak chip and today's status reflecting any new capture

### 6.3 Browse collection

The Collection tab opens to a segmented control at the top: **Spotted** (the user's own collection) or **All North America** (the full Pokédex of 900 NA species). Each tab shows its count, e.g., "Spotted · 47" / "All North America · 900". Spotted is the default and the surface most users live in; All North America is the aspirational, opt-in browse.

**Spotted view (default)**

1. Grid of card thumbnails — 3 columns. Each thumbnail is a mini-card: photo in a tier-color framed unit on top (the frame wraps just the photo, with rounded corners), cream details panel below with family tag (small, inkSoft), species name (bold, 2-line clamp), tier badge (colored pill with tier code), and sighting count (star icon + count in gold). The whole thumbnail has a tier-color border and subtle shadow. See `documentation/design/card.jsx` `BirdCardThumb` for reference.
2. Default sort: **Most recently spotted** (newest first)
3. Section headers based on capture recency. The exact headers adapt to collection size:
   - For collections under ~30 species: "Recent" (last 7 days) and "Earlier"
   - For larger collections: "This week," "This month," "Earlier this year," "Older"
4. Search bar above the grid filters by species name
5. Filter chips below search: Species type, Habitat, Conservation status, Date range
6. Sort menu (accessible from a small affordance in the filter row): Recently spotted (default), Alphabetical, Conservation rarity, Family
7. Tap a card → opens Card detail (§6.9)

**All North America view (Pokédex)**

1. Full catalog of all 900 NA species. Spotted species render as normal thumbnails; unspotted species render as locked thumbnails (muted line border, lock icon + "Not yet" label in details panel, species name visible in muted ink)
2. Grouped by habitat (the 9 habitats from §7.2) with per-group progress in the section header: "Forests · 15 of 92," "Wetlands · 4 of 33," "Cities & towns · 8 of 23," etc.
3. Section headers are tappable to collapse/expand each habitat — helps manage the visual weight of 900 cells
4. Tapping a spotted thumbnail → Card detail (§6.9, spotted variant)
5. Tapping a locked thumbnail → Card detail (§6.9, unspotted variant) — shows card with "?" photo placeholder, species name visible, bottom sheet with range/location info

**Common elements**

- **Sighting count badge** (★N) appears on thumbnails for species the user has spotted more than once. Single-sighting cards don't show the badge — keeps the grid quiet.
- **Empty state** (no captures yet, Spotted view): hero illustration of binoculars + "Photograph your first bird" copy + a CTA that switches to the Capture tab. The All North America toggle is hidden on the empty state to avoid leading new users into an overwhelming view.

### 6.4 Explore

The Explore tab serves two modes: **Near me** (species expected in the user's area) and **My map** (personal sightings). All data served from our own `species_regions` table — no runtime eBird dependency. See `documentation/design/screens-explore.jsx` for the design reference.

The tab opens to a segmented control at the top: **Near me** (default) | **My map**.

**Near me (default)**

A list of species expected in the user's area (state-level, from `species_regions`). Powered by the `explore-species` edge function.

- **Header**: "Near me" title (32px, ExtraBold) + map icon button top-right
- **Location selector**: tappable button with sky-tint icon, "Location" label, current location name (e.g., "Asheville, NC"), chevron-down. No season header.
- **Species rows**: each row contains:
  - Reference illustration thumbnail (54px, rounded 12)
  - Species name (15px, bold) + family tag below (12px, inkSoft)
  - Status badge right-aligned: "Spotted" (sageTint background, sageDeep text, check icon) or "Not yet" (saffronTint background, saffronDeep text)
- **Order**: all species in a flat list — spotted and unspotted mixed, no "chase mode" section divider
- Tap a row → species preview modal

**My map**

The user's personal sightings on the brand-styled interactive map (Mapbox/MapLibre custom style per §18.3).

- Stats trio across the top: Captures / Species / Habitats
- Coral pins for each sighting; clusters with counts when zoomed out
- Tap a single pin → personal sighting detail (date, location, photo, species — deep-links to Collection card detail)
- Tap a cluster → smooth-zoom in to expand it
- Empty state for new users: friendly illustrated map with "Your sightings will appear here once you start capturing" overlay + CTA to switch to Capture tab

**Species preview modal**

Triggered by tapping a row in Near me. Bottom sheet with drag handle.

- Hero: reference illustration + species name + species type
- Habitat pill (informational only)
- Status badge: "Spotted" (sage check) or "Not yet" (saffron)
- Body: About copy from curated DB
- Actions:
  - **View my card** (sage primary) — if user has spotted the species; deep-links to Collection card detail
  - For unspotted species: info-only, with a "Close" affordance.

**Empty / error states**

- *Location permission denied* — "Explore needs your location to show what's near you" with an Open Settings deep-link. My map renders with last-known location or a continental default.
- *Explore data unavailable* — Near me shows a brief retry banner if the `explore-species` edge function fails. Data is served from our own `species_regions` table, so this should be rare (Supabase outage only).

**Deferred to v1.1+**

- Region mode (broader state/bioregion scope)
- Real-time "Live" observations layer
- "Get directions" deep-link
- "Add to target species" / wishlist
- eBird hotspots layer

### 6.5 Achievements

1. User taps Profile tab → Achievements hub
2. Sections: Collection milestones, Streaks, Regional, Family collector
3. Each achievement card shows: name, description, progress (e.g., "7 of 10"), unlock state
4. Unlocked achievements show date earned; locked ones with progress show the criteria
5. Unlocking triggers a celebration overlay and an optional push notification

### 6.6 Streaks

1. Current streak chip shown in the Capture or Collection header (e.g., "🔥 12")
2. Streak detail screen reached from Profile → Streak history. Surfaces:
   - Current streak (large, with flame iconography over a coral-tinted background)
   - Longest streak (stat tile)
   - Capture days total (stat tile — lifetime count of days the user has captured at least once)
   - Calendar grid of the past 4 weeks with capture days highlighted in coral; today carries a dashed outline if the user hasn't captured yet
   - Dynamic bottom prompt: "Capture today to keep it going" (if not yet captured today) or "Streak safe" (if captured)
3. If the streak is broken (no successful capture by end of local day), counter resets at the start of the next day
4. No streak history list or all-time heatmap in v1 — the current beat is what matters

### 6.7 Card unlock reveal

When a successful ID creates a new species card (a "First Sight"), the user sees a five-beat reveal animation. Repeat sightings of an existing species skip the reveal entirely — see §6.2 for the repeat-sighting toast flow.

**Five beats:**

1. **Identifying** (~1.5s) — Captured photo dims to ~50% opacity. A saffron spinner animates above "Identifying..." text. Beat ends when the cloud ID response returns; if the cloud call is slower, the spinner continues until response is back.
2. **Match found** (~0.5s) — Background fades to near-black. A particle burst in the rarity-tier color fires from the center. Brief light haptic tick.
3. **Card materializes** (~1s) — The card frame appears center-screen. Bird photo locks into the hero region; other card details ghost in. Particles continue at moderate intensity. Stronger haptic tick.
4. **First Sight banner** (~1s) — "FIRST SIGHT" small-caps label appears above the card, followed by the species name (e.g., "Northern Cardinal") and the species type underneath (e.g., "Songbird"). Conservation tier is intentionally not surfaced in the banner — it lives in the card's LC/NT/VU/EN/CR footer badge, not in the celebration moment. Card is now fully detailed. Particles peak. "Tap to continue" hint appears after a brief delay.
5. **Settled state** — Background stays dark (`#16181A`). Card (250px wide) centered. Title block left-aligned above the card: "FIRST SIGHT" small-caps label + species name (bold) + family tag. Below the card: two horizontal achievement rows on translucent white surfaces:
   - **Achievement earned** — e.g., "First Feather · 1 of 9 collection milestones" with colored icon block
   - **Family progress** — e.g., "Songbirds · Adept" with sage progress bar showing "3 more to unlock"
   Streak is mentioned as a small inline note (e.g., "+1 day"), not its own row. Two CTAs: "Continue" (back to viewfinder) or "View card" (deep-link to Collection card detail).

**Pacing.** Total elapsed time roughly 4–5 seconds for a normal LC reveal. Tap-to-skip becomes available after beat 2 — a tap anywhere advances directly to beat 5.

**Rarity scaling.** Same core animation across all conservation tiers, with escalating intensity. Copy and beat structure are identical across tiers; only the visual and tactile dial moves.

| Tier | Particle count | Color saturation | Duration multiplier | Haptic intensity |
|---|---|---|---|---|
| LC | Baseline | Saffron / amber | 1.0× | Light |
| NT | +25% | Saffron with coral hints | 1.1× | Light |
| VU | +50% | Coral | 1.25× | Medium |
| EN | +75% | Deep terracotta | 1.4× | Medium |
| CR | +100% | Burgundy with gold accents | 1.6× | Strong |

Conservation framing (donation prompts, protection info) lives in the card detail screen, not the reveal. The reveal stays pure celebration regardless of tier; education comes after the user has had their moment.

**Audio.** No sound effects in v1. Haptics carry the rhythm.

**Accessibility.** Respects the system "Reduce motion" preference — when enabled, beats 2 and 3 cross-fade instead of animating, particles collapse to a single static accent, and the rarity color is communicated through the card frame alone. Tap-to-skip is always available regardless of motion setting.

**First-time user nuance.** On the user's very first card unlock (tutorial capture or first real capture), the reveal plays at full duration and the "tap to continue" hint is delayed by an extra second — give them time to absorb the moment.

**Implementation notes.** Use React Native Reanimated for card scale/position, Lottie for particle bursts (one Lottie per rarity tier), and the existing haptic-feedback pattern (see `documentation/haptic-feedback-pattern.md`) for the tactile cues at beats 2 and 3.

### 6.8 Top-3 candidate picker

When the cloud ID returns a top-candidate confidence in the 60–85% range, the user sees the top-3 picker — a screen that hands the final call to the user with enough information to make an informed pick. This is part of the camera modal flow, presented fullscreen without the tab bar.

**Tone and framing.** The screen frames the moment as collaboration, not failure. Headings use "Pick the bird you spotted" and "A few species look alike — tap the closest match" rather than "we couldn't identify your bird." The user is positioned as the expert who knows what they saw; the AI is the assistant that narrowed down the field.

**Screen anatomy**

1. **Top app bar** — X close (returns to camera viewfinder) on the left; "Identify" small title centered; "?" help icon on the right (reserved; no-op in v1).
2. **User's photo (hero)** — ~30% of the screen height. The captured photo with a "Your photo" pill in the corner. Static at this size in v1 (tap to enlarge is a v1.1 candidate).
3. **Heading section** — "Pick the bird you spotted" (H2) + "A few species look alike — tap the closest match" (caption).
4. **3 candidate rows** — each row contains:
   - Reference image (canonical species illustration, 68px square, rounded) on the left
   - Species name (medium weight)
   - One-line meta: species type + distinguishing feature (e.g., "Songbird · Bright red, black face mask")
   - Chevron right (tap affordance)
   - The top-confidence candidate has a small "Most likely" pill in saffron above the name and a 1.5px saffron border on the row
5. **"None of these match"** — separated by a divider, with a refresh icon. Always visible, never hidden behind a menu.

**Interaction model**

- Tap on any candidate row: immediate selection. Triggers the card unlock reveal animation (§6.7) for the selected species. No confirmation step — users can edit the species from the card detail later (subject to First Sight editability in §15).
- Tap on "None of these match": close the picker and return to the camera viewfinder. Implies "try a different photo."
- Tap X: same as "None of these" — return to viewfinder.
- No first-time tooltip or coach mark — the title and the distinguishing-feature line are the explanation.

**Why no confidence numbers.** Showing "73% confident" anchors users on a number they can't meaningfully interpret and undermines the framing of collaboration. The "Most likely" pill is the only ranking signal in the UI.

**Distinguishing-feature copy.** Each species in the curated DB carries a short distinguishing-feature line authored as part of curation. Guidelines: 5–8 words; focuses on visible field marks (color, pattern, size, bill shape, posture). Used in the picker and as a candidate for any future field-guide surfacing.

**Edge cases**

- All three candidates feel wrong to the user: tap "None of these match" → back to viewfinder.
- User selects a candidate then realizes they misclicked: edit from the card detail in Collection (pending §15 First Sight editability resolution).
- User wants to cancel entirely: X in top bar.
- Cloud ID returns fewer than 3 candidates (rare): render however many came back; never pad with low-confidence filler.

### 6.9 Card detail screen

Reached by tapping any card thumbnail from the Collection grid. Single scrollable screen — no tabs, no card flip in v1. Discoverable, easy to skim.

**Card-centered design.** The BirdCard is the page. See `documentation/design/screens-collection.jsx` for the design reference.

**Top app bar.** Back arrow on the left. Swipe chevrons (circular sage-gradient buttons with white chevron strokes) float on left/right edges for navigating between cards in the collection.

**Layout:**

1. **Background** — warm paper surface (`paper` token)
2. **BirdCard centered** (250px wide) — the full collectible card (tier-color frame, family/name, habitat pill, hero photo, Size/About/First Sight body, habitat footer with conservation + audio + sighting badges). The card has the glossy sheen overlay. This IS the content — no separate sections below it.
3. **Bottom sheet (peek state)** — native bottom sheet peeks at the bottom of the screen:
   - Drag handle
   - Summary line: "Last spotted [date] · [location] · [N] sightings"
   - "Swipe up for sightings · habitat · range" affordance text
4. **Bottom sheet (expanded state)** — card dims and scales down. Sheet slides up to reveal:
   - Recent sightings list (photo thumbnail, date, location per row)
   - Personal sightings map (Mapbox/MapLibre, coral pins)

No quick stats trio, no separate sections — everything is either on the card or in the sheet.

**Action menu (...)** — v1 contains only:
- "Report incorrect ID" (for when the user thinks the species is wrong)

Card sharing/export is deferred to v2 (per §4).

**Unspotted/locked variant** — reached by tapping a locked card in the All North America view:

- **Question mark placeholder** in the hero photo area (hatched background pattern with large "?" character), not a silhouette
- Species name visible (muted ink color) — the user can see what species it is
- The card frame and footer still render, but personal sighting count is hidden
- **Bottom sheet** shows "Where to find them" info: illustrated range map (sage-tinted land, coral range overlay) with a "Summer breeder · Eastern US" style caption
- No "Photograph this species" CTA
- Same swipe chevrons for navigating

### 6.10 Profile home

For v1, Profile is a single combined screen — no separate Settings page. Everything the user can configure or access about themselves lives in one scrollable surface. This keeps the v1 surface minimal and matches the casual-first product pillar.

**Top bar.** Title "Profile" on the left. No gear icon (no separate Settings screen in v1).

**Sections, in order, top to bottom**

1. **Identity block** — circular avatar + display name + "Birding since [month year]"
   - Avatar source: the OAuth provider's profile image (Google sign-in returns one; Apple sign-in does not). If no provider avatar is present, fall back to a sage-tinted circle with the user's first initial.
   - Display name: the user's first name (from OAuth profile or email-derived). No handles in v1; users are not searchable.
2. **Stats trio** — three color-tinted tiles in a single row, each with a colored border:
   - **Species** (sageTint background, sage border, sageDeep number) — total distinct species collected
   - **Streak** (coralTint background, coral border, coralDeep number) — current streak count
   - **Captures** (neutral tint, ink border) — lifetime count of successful captures including repeats
3. **Subscription** — visual depends on plan:
   - Free: sage-gradient banner with Crown icon, "Try birdr+" headline, "Unlimited captures · Member perks · From $2.50/mo" subline, glassmorphic "Upgrade" button (translucent white, blurred). Sage-tinted shadow.
   - Subscriber: smaller "birdr+ Member · Manage" row, neutral background. Tapping opens the Subscription screen in manage mode.
4. **Activity** — two rows each linking to a sub-screen:
   - Achievements (icon: trophy on saffron tint; meta: "14 of 160")
   - Sightings map (icon: map pin on sky tint; meta: "134 captures · 6 habitats")
5. **Support** — three rows under a "SUPPORT" section header:
   - Help & FAQ — opens an in-app web view to support content
   - Send feedback — opens a mailto: to support address (or an in-app form in v1.1)
   - About — version number, credits, links to Privacy and Terms
6. **Account actions** — two standalone rows at the bottom:
   - **Sign out** — destructive-leaning text (red on white). Confirmation alert before sign-out completes.
   - **Delete account** — destructive text. Opens the Delete account confirmation flow (see below).

No edit-profile flow in v1 — display name and avatar are managed via the OAuth provider. (v1.1 candidate: a "display name override" field if users want a birding pseudonym.)

**Defaults for things not exposed in v1 settings**

The following behaviors are fixed in v1 with sensible defaults and not user-configurable. All are v1.1 candidates when a Preferences surface is introduced:

- **Streak reminder push notification time** — 6pm local. On if notifications are enabled at OS level; off otherwise. No per-user time picker.
- **Haptics** — always on. Users can disable via OS-level reduce motion / disable haptics setting.
- **Units** — Imperial (US launch). No metric toggle.
- **Appearance** — follows the system light/dark setting. No in-app override.

**Dev-only tools** (hidden in production builds, visible only in `__DEV__` mode):

- **Unlock all cards** — toggle that overrides the collection view to show all ~900 species as spotted with mock sighting data. Does not write to the database — it's a client-side render override. Useful for testing collection grid performance, card detail layouts, filters, and the All North America view at full population. Toggle off to return to real data.

### 6.11 Delete account flow

Required by App Store policy. Two-step destructive confirmation to prevent accidental deletion. Presented as a native bottom sheet via `react-native-true-sheet`.

1. User taps "Delete account" on Profile home.
2. **Bottom sheet rises** with two-step confirmation:
   - **Step 1**: "Delete your account? This will permanently delete your account, all your collected species cards, sightings, photos, achievements, and streak history. This cannot be undone." With "Cancel" and "Continue" buttons.
   - **Step 2** (if user continued): "Type DELETE to confirm" — text input field. The "Delete account" button stays disabled until the user types DELETE exactly. Sheet uses `keyboardMode` to handle the input gracefully.
4. On confirm: the client calls the `delete-account` edge function (see §12.2), which deletes all of the user's rows from `profiles`, `sightings`, `streaks`, and `user_achievements`, removes all user-uploaded photos from storage, and deletes the auth user record.
5. User is signed out and returned to the welcome screen.

No grace period or soft-delete in v1 — deletion is immediate and irreversible. (v1.1 candidate: 30-day grace period with the option to restore from a "deletion pending" state, which is friendlier to users who change their mind.)

### 6.12 Subscription screen and hard paywall

Same screen content, two presentation modes:

- **Subscription screen** — reached from the Profile home subscription banner (free) or row (subscriber), or any other in-app upsell. Has the standard nav header with back arrow.
   - For free users: shows the tier picker (Yearly $29.99 with "BEST VALUE" badge first, Weekly $3.99 below) + the "Unlimited captures" value prop + a forward-looking "And more coming soon" pitch + Restore purchases link.
   - For subscribers: shows current plan, renewal date, "Manage subscription" (deep-link to RevenueCat customer portal or App Store/Play subscription management), and Restore purchases.
- **Hard paywall** — same content, presented as a fullscreen modal (no tab bar, close X in the corner instead of a back arrow). Triggered when a free user taps the central Capture button on the Capture hub while at zero remaining daily ID quota. Dismissing the modal returns to the Capture hub; subscribing dismisses it and immediately re-opens the capture flow.

The Capture hub displays the daily quota indicator ("2 of 3 captures left today") so users aren't surprised by the paywall. The Capture button is not disabled at zero quota — tapping it surfaces the paywall, not a silent no-op.

### 6.13 Live camera viewfinder

The viewfinder is the fullscreen camera surface inside the capture flow, reached by tapping the central capture button on the Capture hub. The tab bar is hidden — this is a focus mode. All UI is dark/translucent so controls stay legible against any background.

**Layout**

- **Top bar** (subtle dark gradient overlay so controls are readable):
  - **X close** (left) — dark translucent pill, exits the camera, returns to the Capture hub. No confirmation (no work in progress).
  - **Daily quota chip** (center) — pill with bolt icon and "X of Y today" text. Visible to free users only; subscribers don't see it at all.
  - **Flash toggle** (right) — cycles Off / Auto / On with the icon reflecting current state.
- **Live camera feed** fills the screen.
- **Corner brackets** in the center hint at framing. Light, small, not a strict crop — users can shoot off-center. Appear on tap-to-focus and stay visible at low opacity.
- **Zoom controls** — three pill buttons (1× / 2× / 3×) just above the shutter at ~110px from the bottom. Current zoom highlighted in saffron. Pinch-to-zoom gesture also supported; the pills update to reflect the pinch level.
- **Shutter button** (centered, ~24px from bottom) — large white circle with a thick white ring border. Standard camera shutter affordance.

**Explicitly not in v1:**

- Gallery picker (capture is live-only; retroactive identification of existing photos is a v1.1 candidate)
- Front/back camera switch (back camera always — front camera is useless for birding)
- Manual exposure / ISO / white balance controls
- Burst mode
- Last-capture thumbnail
- AI-powered bird-detection overlay (boxes drawn around detected subjects) — v1.1 candidate dependent on ID provider capabilities

**Interactions**

- **Tap-to-focus** — tapping anywhere on the live feed sets focus and exposure to that point. A yellow circle briefly appears at the tap location, then fades over ~500ms.
- **Pinch zoom** — gesture across the live feed zooms continuously. Smooth animated; the pill buttons highlight the nearest preset (1× / 2× / 3×).
- **Volume buttons** — hardware volume keys trigger the shutter (iOS standard).
- **Tap shutter** — captures the frame. Brief white flash overlay (~100ms), strong haptic tick, transition to the photo preview (§6.14).

**Camera permission denied recovery**

If Camera permission is denied during onboarding or revoked later in iOS/Android settings, opening the Capture flow shows a dimmed placeholder (no live feed) with a bottom sheet rising from the bottom of the screen:

- Title: "Camera access needed"
- Body: "birdr uses your camera to identify the birds you photograph. Without it, you can browse your collection, but you can't capture new species."
- Primary action: **Open Settings** — deep-link to iOS/Android app-permission settings
- Secondary action: **Not now** — dismisses the sheet, returns to Capture hub

The sheet is bottom-anchored (not modal-centered) so users can drag-to-dismiss in addition to tapping Not now.

### 6.14 Photo preview

After tapping the shutter, the user lands on the photo preview screen — the gate between "I took a photo" and "send to identify."

**Layout**

- **Top bar** (same dark gradient as viewfinder):
  - **X close** (left) — discards photo, returns to viewfinder
  - **"Looks good?"** small title (center) — friendly check-in
- **Captured photo** fills the screen below the top bar
- **Bottom shelf** (24px from bottom, full-width with padding):
  - **Retake** (left, secondary) — translucent dark pill button with refresh icon, ~30% width
  - **Identify** (right, primary) — saffron pill button with sparkles icon, ~70% width

**Interactions**

- Tap **Retake** or **X** — discards the photo, returns to the live viewfinder. No confirmation needed.
- Tap **Identify** — uploads to the cloud ID edge function, transitions to Beat 1 of the card unlock reveal (§6.7).

No editing tools in v1 (no crop, rotate, brightness adjustment). The cloud ID works with whatever the user shot; cropping and basic enhancement are v1.1 polish candidates if accuracy testing during beta shows a meaningful improvement from pre-processing.

### 6.15 App Store rating prompt

After the card unlock reveal (§6.7) and any achievement celebrations (§10.7) have finished for a First Sight, the app may request an App Store / Play Store rating.

**Trigger:** Every 3rd First Sight (new species). The app tracks a `first_sight_count` locally (not server-side) and shows the prompt when `first_sight_count % 3 == 0`.

**Timing:** The prompt appears after the user taps "Continue" or "View card" on the settled state (beat 5) and after all queued achievement celebrations have been dismissed. Never during the reveal or celebrations — let the user have their moment first.

**Implementation:** Use the native `SKStoreReviewController` (iOS) / In-App Review API (Android) via a React Native wrapper (e.g., `react-native-store-review`). These APIs handle rate-limiting automatically — iOS limits the prompt to 3 times per 365 days regardless of how often the app requests it, and the OS may silently suppress it. The app should call it every 3rd First Sight and let the OS decide whether to actually show it.

**Why after a First Sight:** This is the peak emotional moment — the user just discovered a new species, saw the celebration, and is feeling good about the app. Asking for a rating here converts at the highest rate.

## 7. The bird card

The bird card is the central artifact of the app. Each species the user has photographed gets exactly one card per user.

### 7.1 Card anatomy

See `documentation/design/card.jsx` for the production-reference component. The card has a glossy collectible feel — tier-colored frame, cream interior, illustrated habitat footer.

**Outer frame** — tier-color border (see §18.2 for hex values) wrapping the entire card. Border width ~3.8% of card width. Rounded corners ~7% of card width. Medium shadow. **Glossy sheen overlay**: diagonal `linear-gradient` highlight (bright top-left → neutral mid → shadow bottom-right) using `mix-blend-mode: overlay`, plus a specular gloss band along the top edge.

**Header region** (inside cream body, padded)

- **Family tag** (top-left) — small text (~4% of card width), ink color, 85% opacity. e.g., "Songbird"
- **Species name** (below family) — large bold text (~8.5% of card width), ExtraBold weight, tight letter spacing. e.g., "Cardinal"
- **Habitat pill** (top-right) — outline style: white fill, ink border (1.5px), ink text, pin icon. e.g., "Forests". Informational only in v1 (not tappable).

**Hero photo region**

- User's photo with tier-color inner frame border (~1.4% width). Aspect ratio 4:3. Rounded corners.
- **Locked variant**: hatched background pattern (45deg stripes) with large "?" character in inkFaint.

**Body region** (three labeled text fields, below photo)

- **Size:** e.g., "Approx. 8.3 – 9 inches (21 – 23 cm)"
- **About:** 2–3 sentence editorial description from the curated DB
- **First Sight:** Date + location of the user's first sighting. Hidden on locked cards.

**Footer region** — illustrated habitat scene strip (full width, ~32% of card height) with three circular badges overlaid at the bottom:

- **Conservation badge** (left) — circular, IUCN badge color background (see §18.2), white border + shadow, tier code in white ExtraBold text
- **Audio badge** (center) — circular, sage primary gradient fill, white border + shadow, white music-note icon. Audio deferred from v1 but badge renders as a placeholder.
- **Sighting count badge** (right) — circular, gold (`#C28847`) background, white border + shadow, white star icon. Small dark circle at bottom-right with the count number. Hidden on locked cards.

**Card body interior color**: `#FBF9EF` (warm cream, constant across themes).

Conservation framing: rare-tier cards should celebrate the species' protection rather than treat the bird as a trophy.

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

Five categories, each with multiple tiers. Achievements live in the Achievements hub inside the Profile tab. At launch, the catalog contains roughly 160 achievements across all categories. All achievements are visible to all users from day one — no hidden achievements in v1 (candidate for v1.1).

The mastery categories (Family and Habitat) use a five-tier exponential curve (Spotter/Apprentice/Adept/Expert/Master at 5/10/25/50/100%) chosen deliberately for accessibility — a new user earns their first family-master tier (Spotter) within their first few captures of any type, while Master remains a long-term goal. Collection and Streaks similarly include early-game tiers (1 species, 5 species; 3-day streak) so the first week of use generates several unlock moments rather than one big wall at 7 days.

### 10.1 Collection milestones

Nine tiers spanning the casual-to-completionist range. The first two are named for personality; the rest are numeric milestones:

- **First Feather** — 1 species (any successful capture)
- **Getting Started** — 5 species
- 10 species
- 25 species
- 50 species
- 100 species
- 250 species
- 500 species
- 900 species (all NA species, aspirational)

The First Feather tier fires on the user's very first successful capture, which means every user who completes the capture flow earns at least one achievement on day one.

### 10.2 Streak tiers

3-day, 7-day, 14-day, 30-day, 100-day, 365-day streaks. Lifetime stats; each is a one-time unlock. The 3-day tier provides a quick early win for users who break their first attempt on day 5 or 6 — they still have something to show for the week.

### 10.3 Regional/geographic

- "First spot in [State]" — one per US state (50 achievements)
- "Bird tour" — collect species in 5, 10, 20 different states
- "Local expert" — 50 species in one state (rewards depth, not just travel)

### 10.4 Family/category collector

Five-tiered achievements per species type, mapping to the 9 user-facing types from §7.2. Each type produces five achievements following a roughly exponential curve:

- **Spotter** — 5% of species in the type collected
- **Apprentice** — 10% of species
- **Adept** — 25% of species
- **Expert** — 50% of species
- **Master** — 100% of species

Nine types × five tiers = 45 family achievements at launch. Worked examples (with thresholds rounded up to whole species):

| Family | Species | Spotter (5%) | Apprentice (10%) | Adept (25%) | Expert (50%) | Master (100%) |
|---|---|---|---|---|---|---|
| Songbirds | 87 | 4 | 9 | 22 | 44 | 87 |
| Waterfowl | 48 | 2 | 5 | 12 | 24 | 48 |
| Birds of prey | 33 | 2 | 3 | 8 | 17 | 33 |
| Aerial specialists | 15 | 1 | 2 | 4 | 8 | 15 |
| Game birds | 12 | 1 | 1 | 3 | 6 | 12 |

For small families, the lowest tiers may share the same 1-species threshold — that's intentional. A new user gets two badges on their first Game Bird capture instead of one. The exponential curve front-loads dopamine: Spotter unlocks early and often; Master remains a long-term goal.

Family-collector progress is surfaced in the Achievements hub (in Profile), not on individual card footers. The "7" badge on the card design reference is the user's personal sighting count for that specific species (see §7.1).

### 10.5 Habitat collector

Mirroring family collectors, five-tiered achievements per habitat from §7.2. Each of the 9 habitats produces five achievements (Spotter / Apprentice / Adept / Expert / Master) on the same 5% / 10% / 25% / 50% / 100% curve.

Nine habitats × five tiers = 45 habitat achievements at launch. Habitat populations vary widely — Cities & towns typically completes fastest (small species pool concentrated near most users), while Tundra is one of the slowest (small pool, and most casual users won't travel to spot them). The early-tier unlocks help even slow-moving habitats feel progressed-on.

The Family/Habitat split rewards two different forms of mastery: depth into a taxonomic group (Songbirds) vs. breadth across an ecosystem (Forest). Engaged users naturally pursue both as their collection grows; together the categories give Master-tier users meaningful long-term goals.

### 10.6 Achievement hub UX

Reached from Profile → Achievements. Single scrollable screen. See `documentation/design/screens-profile.jsx` for the design reference.

**Hero progress card** at the top:
- Large bold text: "14 of 160 unlocked"
- Sage progress bar showing overall completion
- Subtle background tint

**Two sections below the hero:**

**Unlocked** — achievements the user has earned, ordered by recency:
- Each row: colored icon block (left, category accent color) — achievement name + "Earned [date]" (center) — sage circular check (right)

**In progress** — achievements the user is working toward:
- Each row: colored icon block (left) — achievement name + category label (center) — "X / Y" count + tier-colored progress bar (right)

Category accent colors (from §18.1):
- Collection: `#008D8F` (sage)
- Streaks: `#E84B4B` (coral)
- Family masters: `#9B6FE0` (purple)
- Habitat masters: `#26A599` (teal-green)

No separate section detail screen or category cards — all achievements are in a single flat list, grouped into Unlocked and In progress. Tapping a row expands it inline to show full description, criteria, and "Next:" teaser.

### 10.7 Unlock celebration

When an achievement unlocks, the user sees a full-screen celebration similar in spirit to the card unlock reveal (§6.7) but shorter and category-themed.

**Visual.** Dark background (~charcoal) with particle bursts in the category's accent color. "ACHIEVEMENT UNLOCKED" small-caps label at top. Large circular badge in the category color with the achievement icon. Achievement name (large), one-line description, and a "Next:" teaser showing the next tier or related achievement (e.g., "Next: 14-day streak — 7 to go"). Continue button at the bottom.

**Timing and pacing.** Total ~3 seconds + user dismissal. Tap-to-skip becomes available after ~0.5s.

**Queue behavior — when multiple achievements fire from one capture.** Auto-queue: after the card unlock reveal's settled state (§6.7 beat 5) dismisses, achievement celebrations play sequentially, one per tap. Order: most "important" first (Master > Expert > Adept > Apprentice > Spotter for mastery; major milestone tiers before regional spots). User can dismiss each with a single tap; queue advances. Total time scales with the number of unlocks but each is fast.

**Asynchronous unlocks.** Streak achievements may fire at midnight-rollover when a streak crosses a threshold (not during a capture). In this case, the celebration shows on the user's next app open. If notifications are enabled and the app is backgrounded, a push notification fires ("You unlocked 30-day streak"); tapping the push opens the celebration.

**Haptics and sound.** Light haptic at celebration start; stronger haptic at badge "land" moment. Silent — same audio philosophy as card unlock (§6.7).

**Accessibility.** Respects system Reduce Motion; particles collapse to a static accent and the badge cross-fades in. Tap-to-skip always available.

## 11. Monetization

### 11.1 Tiers

| Tier | Price | What it gets you |
|---|---|---|
| **Free** | $0 | 3 ID attempts per day. Full access to existing collection, achievements, Explore, streaks, and the entire app surface except capture beyond the daily cap. |
| **Weekly** | $3.99/wk | Unlimited IDs. All v1 features. |
| **Yearly** | $29.99/yr | Unlimited IDs. All v1 features. ~$2.50/month — ~58% cheaper per month than weekly. |

**No free trial in v1.** The free tier itself is the trial — users can experience the full product loop with 3 captures per day and decide to upgrade when the cap becomes friction. Both Apple and Google support adding a free trial later as a subscription configuration change without an app release.

**Pricing rationale.**
- The yearly price matches Picture Bird (closest competitor) at $29.99/yr.
- The weekly price is set above Picture Bird's tier strategy would suggest (cheaper than their $5.99 but priced enough that yearly clearly wins as the value pick).
- The 3/day limit matches Picture Bird and is aggressive — most engaged users hit it within their first real birding outing. This is the central conversion driver in v1.

The daily cap is enforced server-side per §11.3 — the client surfaces it as a friendly counter on the Capture hub ("2 of 3 captures left today") and as a hard paywall when the user tries to exceed it.

### 11.2 What the subscription unlocks

In v1, the subscription does one thing: **removes the daily ID cap.** Subscribers get unlimited captures; free users get 3/day. That's the v1 promise.

Coming in later releases as they ship — surfaced to subscribers as "early access" and to free users as "upgrade to unlock":

- Custom card themes (alternate frame styles, footer art variants) — v1.1
- Detailed personal-collection analytics (busiest park, most active month, regional breakdowns) — v1.1
- Streak revive (one-time freeze to save a broken streak) — v1.1
- Audio sound recognition (record bird calls to identify) — v2
- Card export as image (personal use, social sharing) — v2

The simplicity of the v1 promise (one feature: unlimited captures) is intentional. It avoids a long bullet list of features that aren't yet built and instead positions the subscription as a clean trade: unlimited use for the casual price of a coffee per month.

For users who pay primarily to support indie development rather than for the cap removal, the subscription marketing copy includes a brief "supports a small team building birdr" framing — common in casual hobby app subscriptions.

### 11.3 Paywall entry points

The paywall surfaces in two places (see §6.10 and §6.12 for screen details):

1. **Profile home subscription banner / row** — soft, always-visible nudge. For free users, a saffron upgrade banner. For subscribers, a smaller "Manage" row. Both open the Subscription screen.
2. **Hard paywall at daily limit** — when a free user taps the central Capture button on the Capture hub while at zero remaining daily ID quota, the Subscription content presents as a fullscreen modal with an X close. This is the highest-converting moment because the user is in the middle of trying to capture something.

No separate Settings → Subscription entry in v1 (no settings page). No Capture hub soft nudge at the quota limit beyond the daily quota indicator itself — the Capture button remains tappable and surfaces the hard paywall on tap.

### 11.4 Implementation

Use RevenueCat per `documentation/subscription-pattern.md`. Track purchase events in PostHog per `documentation/posthog-pattern.md`.

## 12. Technical architecture

birdr inherits the engineering patterns documented in `documentation/`. Reuse without modification where possible.

### 12.1 Frontend

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation per `navigation-pattern.md` — four-tab bottom-tab navigator with stack navigators inside each tab
- Atomic design system per `atomic-design-pattern.md` and `atomic-design-extended-atoms.md`
- Haptic feedback per `haptic-feedback-pattern.md`
- Bottom sheets: `react-native-true-sheet` (`@lodev09/react-native-true-sheet`) — native bottom sheet for destructive confirmations (delete account). Requires New Architecture (Fabric).
- Auth: Supabase Auth with Apple and Google OAuth providers only (no email/password in v1). See auth architecture below.
- Map rendering: Mapbox or MapLibre with a custom style approximating the brand palette for interactive maps (Explore, global sightings, per-card sightings)

### 12.2 Backend

- Supabase (auth, Postgres, edge functions, storage)
- User photo storage per `upload-pattern.md` — photos uploaded to Supabase storage **after** bird is confirmed, not before

#### Authentication architecture

Apple + Google OAuth only via Supabase Auth. No email/password in v1.

**Auth flow:**

1. User launches app → check for existing session
2. No session → welcome carousel (3 slides) → sign-in screen (Apple / Google)
3. OAuth completes → Supabase creates row in `auth.users`
4. DB trigger auto-creates `profiles` + `streaks` rows (see trigger below)
5. Permission rationale screen (Camera, Location, Notifications)
6. Tutorial capture (skippable)
7. `profiles.is_onboarded` set to `true` → Capture hub
8. Returning users: session exists, `is_onboarded = true` → straight to Capture hub

**Profile creation trigger** — fires on `auth.users` insert, no client logic needed:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, created_at, ids_used_today, last_quota_reset_date, is_onboarded)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Birder'),
    NOW(),
    0,
    CURRENT_DATE,
    false
  );

  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_capture_date, total_capture_days)
  VALUES (NEW.id, 0, 0, NULL, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Display name pulls from OAuth provider metadata (`full_name` from Google, `name` from Apple). Falls back to "Birder."

**Edge function auth pattern** — all edge functions extract user identity from the JWT. No client-sent user IDs trusted. No edge function is callable without authentication.

```typescript
const authHeader = req.headers.get('Authorization')!;
const { data: { user }, error } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
const userId = user.id;
```

**Auth context** (client-side):

```typescript
type AuthContextType = {
  session: Session | null;
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isOnboarded: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};
```

#### Edge functions

Four edge functions. Three handle core flows, one handles account deletion.

**`identify-bird`** — Receives image bytes + location, returns species candidates.

1. **Auth check** — validate JWT
2. **Quota check** — read `profiles.ids_used_today` and `last_quota_reset_date`. Reset counter if new day. If free user and `ids_used_today >= 3`, return `402 quota_exceeded` (client shows hard paywall). Increment counter.
3. **Call vision API** — send image + location context to the bird ID provider (see provider architecture below). Provider returns ranked species candidates with confidence scores.
4. **Match species** — map returned species names to `species` table IDs via shared `matchSpecies()` utility (exact match on `common_name`, scientific name fallback).
5. **Apply confidence thresholds** and return:
   - **≥ 85%** → `{ result: "auto_accepted", species: { id, common_name, scientific_name, conservation_status } }`
   - **60–85%** → `{ result: "pick", candidates: [top 3 with distinguishing_feature, is_top flag] }`
   - **< 60%** → `{ result: "retry", guidance: "..." }`

Quota is consumed regardless of outcome (prevents gaming). No photo persisted. No sighting created.

**`confirm-sighting`** — Receives confirmed species + uploaded photo path, persists everything.

Input: `{ species_id, photo_storage_path, lat, lon, named_location, captured_at, timezone }`

1. **Validate** — species exists, photo exists in storage, user owns the storage path
2. **Insert sighting** — new row in `sightings`
3. **Determine First Sight** — `COUNT(*) FROM sightings WHERE user_id AND species_id` (excluding new row)
4. **Update streak** (lazy, no cron):
   - Compute user's local date from `captured_at` + `timezone`
   - Same day as `last_capture_date` → no-op
   - Yesterday → `current_streak += 1`, update `longest_streak` if needed, increment `total_capture_days`
   - Older or null → `current_streak = 1`, increment `total_capture_days`
5. **Evaluate achievements** (scoped to what changed):
   - Always: check streak tiers (3, 7, 14, 30, 100, 365)
   - If First Sight: check collection milestones (1, 5, 10, 25, 50, 100, 250, 500, 900), family mastery for this species' type, habitat mastery for this species' habitat
   - Upsert changed `user_achievements` rows; `COALESCE` on `unlocked_at` to never overwrite an existing unlock
6. **Return response**:
   ```json
   {
     "sighting_id": "...",
     "is_first_sight": true,
     "species": { "id", "common_name", "conservation_status" },
     "streak": { "current": 13, "longest": 28, "incremented": true },
     "achievements_unlocked": [{ "id", "name", "category" }]
   }
   ```

Transaction safety: sighting insert + streak update wrapped in a single Postgres transaction. Achievement evaluation runs after commit — if it fails, the sighting is still valid and achievements can be re-evaluated on the next capture. This keeps lock duration tight.

Performance notes: worst case is ~50-100ms for a First Sight by a power user with 10k+ sightings (5-6 queries for achievement evaluation). Repeat species captures are ~10-20ms (3 queries). No optimization needed for v1. If performance becomes an issue later, denormalize `total_species_collected` onto `profiles` to eliminate the `COUNT(DISTINCT species_id)` scan.

**`explore-species`** — Serves the Explore tab's Near me mode.

Input: `{ lat, lon }`

1. **Resolve lat/lon → state code** — point-in-polygon against a lightweight US state boundary dataset (~50KB)
2. **Query `species_regions`** joined to `species` and user's sightings (via `cards` view) for that state
3. **Return shaped response**:
   ```json
   {
     "region_label": "North Carolina",
     "season_label": "Spring",
     "species": [
       {
         "id": "...",
         "common_name": "Northern Cardinal",
         "scientific_name": "Cardinalis cardinalis",
         "species_type": "Songbird",
         "season": "year_round",
         "frequency": 0.82,
         "spotted": true,
         "illustration_storage_path": "..."
       }
     ]
   }
   ```

Species ordered: unspotted first, then by frequency descending. No runtime eBird API dependency — data served from our own `species_regions` table, hydrated from eBird bulk downloads during development.

**`delete-account`** — Hard deletes all user data. Required by App Store policy (see §6.11).

Input: none (user ID from JWT).

1. **Auth check** — extract user from JWT
2. **Delete user photos from storage** — list and remove all objects in the user's storage path
3. **Delete user data** (ordered for FK constraints):
   ```sql
   DELETE FROM user_achievements WHERE user_id = $1;
   DELETE FROM sightings WHERE user_id = $1;
   DELETE FROM streaks WHERE user_id = $1;
   DELETE FROM profiles WHERE user_id = $1;
   ```
4. **Delete auth user** — `supabase.auth.admin.deleteUser(userId)` (requires service role key)
5. **Return** `{ success: true }`

Client signs out and returns to the welcome screen on success. This function uses `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) because `auth.admin.deleteUser()` is an admin operation.

#### Bird ID provider architecture (IoC)

The vision API provider is abstracted behind a `BirdIdProvider` interface so providers can be swapped via environment variable without changing edge function code.

```typescript
interface BirdIdProvider {
  identify(image: Uint8Array, location: { lat: number; lon: number }): Promise<IdentifyResult>;
}
```

Provider adapters implement this interface. Each adapter owns its own prompt engineering and API-specific logic. A factory function reads `BIRD_ID_PROVIDER` env var and returns the appropriate adapter.

v1 default: **GPT-4o** (~$0.003 per ID). Prompt includes location context and constrains output to the ~900 NA species DB for higher accuracy than raw benchmarks suggest. Confidence thresholds (85% / 60%) live in the edge function, not the adapter — swapping providers doesn't change UX behavior.

Future provider candidates: Gemini Flash (cheaper, faster), Claude Sonnet, custom fine-tuned model, or specialized bird classifiers (BirdRecon, Merlin if API becomes available).

### 12.3 Services

- PostHog — product analytics (`posthog-pattern.md`)
- RevenueCat — subscriptions (`subscription-pattern.md`)
- **OpenAI API (GPT-4o)** — bird identification via vision API. Default v1 provider behind IoC adapter.

Note: eBird API is **not** a runtime dependency in v1. Species regional/seasonal data is hydrated from freely available eBird bulk downloads (taxonomy CSV + bar chart data) during development and stored in `species_regions`. See §13.2 for the hydration pipeline.

### 12.4 Database schema

#### Lookup tables (seeded, read-only)

**`species_types`** — Bird type categories (Songbird, Waterfowl, Birds of prey, etc.) for filtering and family mastery achievements.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | unique |

**`habitats`** — Habitat categories (Forest, Wetland, Urban, etc.) for filtering and habitat mastery achievements.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | unique |

#### Species reference data (seeded, ~900 rows)

**`species`** — Curated North American bird species.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| common_name | text | |
| scientific_name | text | |
| family | text | |
| order | text | |
| species_type_id | uuid | FK → species_types |
| primary_habitat_id | uuid | FK → habitats |
| conservation_status | enum | LC / NT / VU / EN / CR |
| about_text | text | ~2-3 sentence editorial description |
| distinguishing_feature | text | 5-8 word line for top-3 picker |
| size | text | |

Indexes: `species_type_id`, `primary_habitat_id`

**`species_audio`** — Audio file references per species (song, call variants).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| species_id | uuid | FK → species |
| storage_path | text | Supabase storage bucket path |
| label | text | e.g. "song", "call" |

Indexes: `species_id`

**`species_regions`** — Regional presence and seasonality per species. Hydrated from eBird bulk downloads during development. State-level granularity for v1.

| Column | Type | Notes |
|---|---|---|
| species_id | uuid | PK, FK → species |
| region_code | text | PK, e.g. "US-NC" |
| season | enum | `year_round`, `summer`, `winter`, `migratory`, `rare` |
| frequency | float | 0.0–1.0, peak detection frequency |

Indexes: `(region_code, season)`

**`species_illustrations`** — Illustration asset references per species.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| species_id | uuid | FK → species |
| storage_path | text | Supabase storage bucket path |
| variant | text | |

Indexes: `species_id`

#### User data

**`profiles`** — Extends Supabase auth (1:1 with `auth.users`). Created automatically via DB trigger on `auth.users` insert (see §12.2 auth architecture).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK (= auth.users.id) |
| display_name | text | from OAuth provider metadata |
| created_at | timestamptz | |
| ids_used_today | int | default 0 |
| last_quota_reset_date | date | |
| is_onboarded | boolean | default false; set true after permissions + tutorial |

Indexes: PK only

**`sightings`** — Every successful capture event.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| species_id | uuid | FK → species |
| photo_storage_path | text | Supabase storage bucket path |
| captured_at | timestamptz | |
| lat | float8 | precise GPS |
| lon | float8 | precise GPS |
| named_location | text | |
| display_location | text | fuzzed, for v2 social |

Indexes:
- `(user_id, species_id, captured_at ASC)` — card detail, hero photo, cards view aggregation, species count
- `(user_id, captured_at DESC)` — recent captures, pagination, streak calendar

Schema note: `display_location` is added now even though v1 doesn't use it publicly. This avoids a painful migration when social features arrive in v2.

**`streaks`** — Current streak state per user (1:1 with profiles). No history table — the 60-day calendar is derived from sightings.

| Column | Type | Notes |
|---|---|---|
| user_id | uuid | PK, FK → profiles |
| current_streak | int | default 0 |
| longest_streak | int | default 0 |
| last_capture_date | date | user's local date |
| total_capture_days | int | default 0, lifetime count |

Indexes: PK only

Streak logic is lazy — no cron job. The streak resets implicitly when the user's next capture detects a gap in `last_capture_date`.

**`user_achievements`** — Progress and unlock state per user per achievement. Achievement definitions (~105 total) live in app/edge function code, not in the DB.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| achievement_id | text | matches ID from app-side achievement registry |
| progress | float | 0.0–1.0 |
| unlocked_at | timestamptz | nullable; null = in progress |

Indexes:
- unique constraint on `(user_id, achievement_id)`
- partial index on `(user_id, unlocked_at DESC) WHERE unlocked_at IS NOT NULL` — recent unlocks query

Achievement categories in v1: collection milestones (9), streak tiers (6), family masters (45), habitat masters (45). Regional/geographic achievements deferred to v2.

#### Derived

**`cards`** (Postgres view, not a table) — Per-user-per-species aggregate derived from sightings. Hero photo is always the first sighting photo (not user-selectable in v1).

```sql
SELECT DISTINCT ON (s.user_id, s.species_id)
  s.user_id,
  s.species_id,
  s.photo_storage_path AS hero_photo_storage_path,
  s.captured_at AS first_seen_at,
  agg.last_seen_at,
  agg.sighting_count
FROM sightings s
JOIN (
  SELECT user_id, species_id,
         MAX(captured_at) AS last_seen_at,
         COUNT(*) AS sighting_count
  FROM sightings
  GROUP BY user_id, species_id
) agg ON agg.user_id = s.user_id AND agg.species_id = s.species_id
ORDER BY s.user_id, s.species_id, s.captured_at ASC
```

#### Device caching strategy

The following reference data is cached on-device after first launch and re-synced on app update: `species`, `species_types`, `habitats`, `species_audio`, `species_illustrations`. Sightings are invalidated on capture and paginated. Streak state, daily quota, and explore data read from Supabase directly.

#### Index summary

| Table | Indexes beyond PK |
|---|---|
| species_types | — |
| habitats | — |
| species | `species_type_id`, `primary_habitat_id` |
| species_audio | `species_id` |
| species_regions | `(region_code, season)` |
| species_illustrations | `species_id` |
| profiles | — |
| sightings | `(user_id, species_id, captured_at)`, `(user_id, captured_at DESC)` |
| streaks | — |
| user_achievements | unique `(user_id, achievement_id)`, partial `(user_id, unlocked_at DESC) WHERE NOT NULL` |

## 13. Data sources and curation

### 13.1 Custom curated DB

The 900-species North American bird DB is the highest-effort pre-launch task. The pipeline is split into automated hydration (steps 1-7) and LLM-assisted curation (steps 8-9).

#### Hydration pipeline (automated, ~5 minutes)

1. **Download Clements/eBird taxonomy CSV** — freely available, contains common name, scientific name, family, order, species code, range descriptions
2. **Filter to ~900 NA species** — by region/range descriptions in the CSV
3. **Join IUCN conservation status** — match on scientific name from IUCN Red List CSV
4. **Download 50 state bar charts from eBird** — predictable URLs, scriptable with polite delays
5. **Parse bar charts → season tags + frequency** — classify each species-state pair as `year_round`, `summer`, `winter`, `migratory`, or `rare` with peak frequency value
6. **Insert `species` rows** — taxonomy + conservation status (species_type_id, primary_habitat_id, about_text, distinguishing_feature, size left null)
7. **Insert `species_regions` rows** — ~45,000 rows

#### LLM-assisted curation (step 8, ~1 day generation + 1-2 weeks human review)

8. **LLM batch prompt** — one structured prompt per species returning all curated fields:

   Input context per species: common name, scientific name, family, order, conservation status, range description from Clements CSV.

   Output (structured JSON):
   ```json
   {
     "species_type": "Songbird",
     "primary_habitat": "Forest",
     "size": "8-9 inches",
     "about_text": "The Northern Cardinal is one of the most recognizable...",
     "distinguishing_feature": "Bright red, black face mask"
   }
   ```

   After the batch runs, a script maps `species_type` and `primary_habitat` strings to UUIDs in the `species_types` and `habitats` lookup tables and updates `species` rows.

   LLM prompt guidelines:
   - `species_type`: must be one of the 9 values in `species_types` (Songbird, Waterfowl, Birds of prey, Shorebird, Seabird, Woodpecker, Game bird, Aerial specialist, Hummingbird)
   - `primary_habitat`: must be one of the 9 values in `habitats` (Forest, Grassland, Desert, Wetland, Freshwater, Coast, Mountain, Tundra, Urban)
   - `size`: typical length range in inches
   - `about_text`: 2-3 sentences for a casual bird watcher. Key visual features, typical habitat, one interesting behavioral fact. No jargon.
   - `distinguishing_feature`: 5-8 words, visible field marks (color, pattern, size, bill shape, posture)

9. **Human review** — review all LLM-generated text and classifications for accuracy. Quality matters more than coverage. Estimated 1-2 weeks.

#### Deferred to later

- Audio from xeno-canto (CC-licensed bird recordings) — verify license compatibility per recording
- Species illustrations — sourcing/creation TBD
- Manual QA pass on every species before launch

### 13.2 Species regional data hydration

The Explore tab uses **our own `species_regions` table**, not a live eBird API connection. The data is hydrated from freely available eBird bulk downloads during development — no runtime external API dependency, no commercial license required.

#### Hydration pipeline (one-time development script)

1. **Download eBird/Clements taxonomy CSV** — freely available from the Clements Checklist website. Contains common name, scientific name, family, order, species code for all birds. Used to seed the `species` table and map eBird species codes to our DB.
2. **Download bar chart frequency data per state** — 50 state-level downloads from eBird's bar chart pages (predictable URLs, scriptable). Each file contains detection frequency per species per week-of-year (48 values per species).
3. **Parse frequency data into season tags** — for each species in each state, classify as `year_round`, `summer`, `winter`, `migratory`, or `rare` based on which months show meaningful detection (>5% frequency threshold). Extract peak frequency value.
4. **Match species codes to our DB** — join on scientific name via the Clements taxonomy CSV. Skip species not in our 900-species NA DB.
5. **Insert into `species_regions`** — ~45,000 rows (900 species × 50 states, minus species not present in a given state).

Total runtime: ~5 minutes. Re-run yearly when eBird updates their taxonomy.

#### Data sources (no commercial license needed)

- **eBird/Clements taxonomy CSV** — freely downloadable, updated annually
- **eBird bar chart data** — freely downloadable per region from the eBird website
- **IUCN Red List CSV** — conservation status, freely available for research use

eBird's API terms restrict commercial runtime use, but bulk downloads of aggregate research data for seeding a curated DB are a different use case. The app serves its own data, not eBird's API.

#### Future upgrades (v1.1+)

- Real-time "Live" observations layer (requires eBird commercial API terms or alternative data source)
- County-level granularity for more precise "Near me" results

### 13.3 Asset hosting

Static assets (audio, illustrations, habitat backgrounds) hosted on Supabase storage with CDN. Range maps deferred from v1 (see §12.4). Avoid in-app bundling unless total size stays under ~50 MB.

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
- Account deletion flow per App Store requirements — accessible from Profile home as a destructive action with a two-step confirmation; immediate hard delete, no grace period in v1 (see §6.11)

### 14.3 Future-proofing for social

When v2 introduces social features, public-facing sighting locations must be fuzzed (round to nearest named place ≥1 km radius) to protect users from accidentally revealing home addresses. The schema should support both `precise_lat/lon` (private) and `display_location` (public, fuzzed) from v1.

## 15. Open questions

1. ~~**Audio button UX on card:**~~ Deferred — audio assets not in v1.
2. **First Sight permanence:** Frozen forever, or editable? (v1: frozen, uses first photo)
3. ~~**ID provider final pick:**~~ **Resolved — GPT-4o via IoC adapter** (see §12.2).
4. **Onboarding length:** How many tutorial screens before dropping into the app?
5. **Notification defaults:** Default reminder time, user customization scope
6. ~~**Explore "Near me" scope:**~~ **Resolved — state-level for v1** (see §12.2 `explore-species`).
7. ~~**eBird aggregate API commercial terms:**~~ **Resolved — no runtime API dependency.** Species data hydrated from bulk downloads (see §13.2).
8. **Capture tab when launching camera mid-session:** When the user has the camera modal open and dismisses it, do they return to a fresh hub or the previous in-progress capture? (Working answer: dismiss = abandon; return to fresh hub.)
9. ~~**Explore "target species" save:**~~ Deferred to v1.1.
10. **Rarity gradient exact stops:** Working defaults are LC=saffron, NT=light orange, VU=coral, EN=terracotta, CR=burgundy. Validate against the full palette and the look of common species frames.

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
| Explore feels thin without real-time data | M | M | Lean into research positioning ("what you'll find here") rather than "what's happening now"; v1.1 adds live layer once data density improves |

## 18. Visual design language

The visual direction is **gamified collection with naturalist warmth** — a hybrid of Pokémon GO's game-like energy (bold components, gradient buttons, bouncy animations, progress everywhere) with birdr's nature palette (teal, mint, warm amber, illustrated habitats). The design prototype lives in `documentation/design/` as HTML/CSS/JS reference files.

### 18.1 Color palette (Vivid/Mint theme — v1 default)

The v1 palette uses a teal-mint direction. A warmer "Field guide" palette exists in the design files as an alternate theme for potential future use.

**Brand colors:**

| Role | Token | Hex | Where it appears |
|---|---|---|---|
| Primary | `sage` | `#008D8F` | Tab active state, primary buttons, capture button, achievement collection accent |
| Primary light | `sageLight` | `#5DC79C` | Gradient end, highlights |
| Primary gradient | `sageGrad` | `linear-gradient(135deg, #008D8F, #5DC79C)` | Primary buttons, capture button, subscription banner, audio badge |
| Primary tint | `sageTint` | `#D6EEEE` | Segmented control background, spotted badges, stats tile background |
| Primary deep | `sageDeep` | `#00595B` | Active tab text, badge text on tint |
| Accent | `saffron` | `#FFB347` | Warm amber accents, accent labels |
| Accent light | `saffronLight` | `#FFD18A` | Flash icon tint, light accents |
| Accent deep | `saffronDeep` | `#B86B00` | Accent label text (onboarding carousel) |
| Warm CTA | `coral` | `#E84B4B` | Streak flame, destructive actions, streak achievement accent |
| Warm CTA light | `coralLight` | `#F38787` | Light warm accents |
| Cool secondary | `sky` | `#4FBDC0` | Cyan-teal, location pin backgrounds, info accents |
| Cool secondary light | `skyLight` | `#8FD5D7` | Light info backgrounds |

**Surfaces and text:**

| Role | Token | Hex |
|---|---|---|
| Surface | `cream` | `#EAF5E5` (pale mint) |
| Paper | `paper` | `#DDEED7` (card detail background) |
| Card body interior | — | `#FBF9EF` (warm cream, constant) |
| Text primary | `ink` | `#1B3937` |
| Text secondary | `inkSoft` | `#4A6E6A` |
| Text faint | `inkFaint` | `#8AA4A0` |
| Line/border | `line` | `#CFE3CB` |

**Shadows:**

| Level | Value |
|---|---|
| Small | `0 1px 2px rgba(40,30,20,.06), 0 2px 6px rgba(40,30,20,.04)` |
| Medium | `0 4px 12px rgba(40,30,20,.08), 0 12px 32px rgba(40,30,20,.06)` |
| Large | `0 12px 36px rgba(40,30,20,.16), 0 36px 80px rgba(40,30,20,.12)` |

**Achievement category accents:**

| Category | Color |
|---|---|
| Collection | `#008D8F` (sage) |
| Streaks | `#E84B4B` (coral) |
| Family masters | `#9B6FE0` (purple) |
| Habitat masters | `#26A599` (teal-green) |

### 18.2 Card frame rarity system

Conservation status drives the card's border color and footer badge. These are IUCN semantic colors — constant across themes.

| IUCN | Frame color | Badge background |
|---|---|---|
| LC (Least Concern) | `#EFC027` | `#69A444` |
| NT (Near Threatened) | `#E89A3B` | `#B2A53A` |
| VU (Vulnerable) | `#D85A30` | `#E29C2A` |
| EN (Endangered) | `#A53A1F` | `#D85A30` |
| CR (Critically Endangered) | `#6B1A12` | `#993C1D` |

Conservation badges appear as circular badges in the card footer (left position) with white border and shadow. Badge shows the tier code (LC/NT/VU/EN/CR) in white bold text on the badge background color.

### 18.3 Map aesthetic and strategy

Interactive maps are used for two surfaces in v1:

- Per-card personal sightings map (in card detail bottom sheet)
- Global sightings map (My map in Explore tab)

Implementation: Mapbox GL or MapLibre with a custom style tuned to the brand palette. Land = teal-sage gradient, water = cyan-teal, pins = coral. No roads, no labels except major place names.

Per-card range maps are deferred from v1 (see §13.1).

### 18.4 Typography

**Plus Jakarta Sans** (Google Fonts, free, OFL) for the entire app. Weights used in the design:

- Regular (400) — body copy, supporting text
- Medium (500) — section labels, meta text
- SemiBold (600) — pills, badges, filter chips, tab labels
- Bold (700) — buttons, row titles, card family tag, species names in lists
- ExtraBold (800) — page titles, card species name, stat numbers, wordmark

Tabular figures enabled globally (`font-feature-settings: "tnum" 1`) so stat numbers stay vertically aligned. Letter spacing slightly negative (`-0.005em`) for a tighter, modern feel.

### 18.5 Iconography

**Lucide** (free, ISC license) as the primary icon set. Outline-only style, stroke width 2. Used for tab bar, action buttons, list affordances, settings.

Tab bar icons: Binoculars (Capture), Book (Collection), Compass (Explore), User (Profile).

### 18.6 Chrome components

Defined in the design prototype (`documentation/design/chrome.jsx`):

**TabBar** — sage primary 2px top border. Themed background (pale mint wash with backdrop blur). Active tab: small sage dot indicator above icon + sage-colored icon + semibold label. Inactive: faint icon + regular label.

**PrimaryButton** — sage gradient fill (`135deg, #008D8F → #5DC79C`) with sage-tinted shadow (`0 6px 16px #008D8F40`). White text, bold, pill-shaped (borderRadius 999). Sizes: sm (9px 14px), md (14px 20px), lg (17px 22px).

**GhostButton** — white fill, line border, ink text. Pill-shaped.

**SegmentedControl** — sageTint background, rounded 12px. Active segment: white pill with sageDeep text + sage-tinted shadow. Inactive: transparent, 65% opacity.

**Pill** — inline badge. sageTint background, sageDeep text by default. Pill-shaped (borderRadius 999).

**CircleBtn** — circular icon button, white background with subtle shadow. Dark variant for camera/dark surfaces.

### 18.7 Habitat footer illustrations

Nine habitat scenes (forest, grassland, desert, wetland, freshwater, coast, mountain, tundra, urban) are needed for the card footer backgrounds. Owner will provide finished art. Style: illustrated field-guide aesthetic, simplified to read at small sizes on the card footer.

---

**Next steps**

1. Finalize visual design tokens (from separate design process)
2. Stand up Supabase project (auth, schema migration, storage buckets, DB trigger for profile creation)
3. Run species DB hydration script (taxonomy + conservation + regions) and LLM batch curation
4. Scaffold Expo app with React Navigation (4-tab structure)
5. Implement edge functions (`identify-bird`, `confirm-sighting`, `explore-species`, `delete-account`)
6. Build the capture → ID → card vertical slice as the first engineering milestone
7. Wire up remaining screens (Collection, Explore, Profile, Achievements)
8. Beta test with 20–50 casual bird watchers before public launch
