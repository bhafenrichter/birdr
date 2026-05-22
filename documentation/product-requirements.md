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

**Explore tab (~4 screens)**

- Explore map (default) — birds reported near the user, pulled from the eBird "recent observations nearby" API, with map pins per species
- Common species list — scrollable list of birds frequently seen in the user's region, with a "spotted / not spotted" status overlay derived from the user's collection
- My global map — the user's personal sightings worldwide
- Species preview (modal) — tap any bird in the map or list to see a preview card with sighting status; can deep-link to the user's existing card if they've already collected the species

The Explore tab does *not* include hotspots in v1 (deferred — fine candidate for v1.1 if Explore engagement is strong).

**Profile tab (~6 screens)**

- Profile home (single combined screen: identity, stats trio, subscription banner/row, activity links, support links, sign out, delete account)
- Subscription screen (current plan + tier picker + features for free users; manage / restore for subscribers)
- Hard paywall (same content as Subscription screen but presented as a fullscreen modal when a free user hits the daily ID limit)
- Achievements hub (5 sections: Collection, Streaks, Regional, Family masters, Habitat masters)
- Achievement section detail (one per category)
- Streak detail (current streak, longest streak, capture days total, past-4-weeks calendar)
- Delete account confirmation (two-step destructive flow)
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

A short, opinionated flow designed to get a new user to their first card unlock in under 90 seconds. Five steps; the welcome carousel and tutorial capture are both skippable for impatient users. Permissions are required.

**1. Splash.** Brief brand moment with the birdr wordmark and binoculars iconography. Auto-advances to the welcome carousel after ~1 second.

**2. Welcome carousel** — three slides, each with a hero visual + headline + supporting copy + pagination dots. "Skip" available top-right on every slide. Slides cover the three product pillars in order:

- **Slide 1 — Identify any bird you spot.** "Take a photo and birdr tells you the species — plus habitat, size, range, conservation status, and what its call sounds like." Hero visual: a captured bird photo with a thin overlay of identification metadata. Leads with the educational/naturalist angle.
- **Slide 2 — Unlock a card for every species.** "Each species becomes a collectible card with your photo as the hero. Build your personal aviary." Hero visual: the card design (Cardinal style).
- **Slide 3 — Birding becomes a habit.** "Daily streaks, milestones, and achievements turn every walk into an adventure." Hero visual: the streak flame + a peek at the achievements hub.

Tapping Skip jumps directly to sign-in.

**3. Sign in** — OAuth-only screen. Required buttons in order:

- **"Continue with Apple"** — primary position (dark button, Apple branding). Required by Apple App Store policy for any app that offers third-party sign-in.
- **"Continue with Google"** — secondary position (outline button, Google branding).

No email/password in v1. Terms and Privacy Policy links at the bottom. The provider returns display name and (Google only) an avatar image; Apple users fall back to a sage-tinted circle with their first initial (see §6.10).

**4. Permissions** — single rationale screen covering all three permissions in one place. Three rows with semantic-colored icons + name + one-line rationale:

- **Camera (required)** — sage accent. "So you can photograph birds for identification."
- **Location (required)** — sky-blue accent. "To record where you spotted each bird. Used in your personal map and regional achievements."
- **Notifications (optional)** — coral accent. "Streak reminders and achievement alerts."

Single "Continue" button triggers the OS prompts in sequence (Camera → Location → Notifications). The rationale screen exists primarily to give context before the OS prompts — Apple's prompts are short and don't communicate the value clearly on their own.

**Denied permission handling:**

- *Camera denied*: app remains usable; the Capture button on the hub surfaces a "Camera access needed" sheet with a "Open Settings" deep-link button.
- *Location denied*: app remains usable; sightings are recorded without location metadata, regional achievements don't progress, and the Explore tab shows a "Location needed for nearby birds" prompt with a Settings deep-link.
- *Notifications denied*: app fully functional; no streak reminders or unlock notifications. We may re-prompt at strategic moments (e.g., after the 7-day streak achievement) but not in v1.

**5. Tutorial capture (interactive, skippable)** — a pre-staged sample capture experience. The user sees a sample Cardinal photo, a "Try it out" header, and a big saffron Identify button. Tapping it runs the full Identify → reveal animation using the sample data, ending with the user seeing the Cardinal card materialize. A "Sample" or "Tutorial" badge appears on the card so it's not added to the user's real collection. The reveal is at the standard pace — they see the haptic ticks, the particle burst, the banner. Then they see the settled state with mock bonus chips ("Streak +1 → 1 day," "First Feather"). A "Continue" button drops them into the Capture hub. Skip is available top-right.

The point of the tutorial: get the user through one complete loop before they've taken a real photo, so they know what to expect when they do.

**6. Drop into Capture hub** — no coach mark, no overlay, no tooltip. The Capture hub's central saffron button with the binoculars icon is its own affordance. Users who completed the tutorial know what tapping it does; users who skipped will figure it out instantly. The Recent strip is empty; the daily streak prompt reads "Capture today to start your streak."

**Total time** — under 90 seconds for a user who skips the carousel and tutorial. Under 3 minutes for a user who watches everything.

**Returning users.** None of steps 2, 4, 5, or 6 fire for returning users. The app launches straight to the Capture tab.

### 6.2 Capture → ID → Card

1. User is on the Capture tab (the hub) — sees their streak, today's status, recent captures, and a large central capture button
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

1. Grid of card thumbnails — 3 columns, full yellow frame on each, bird photo as the body, species name at the bottom, optional sighting count badge (★N) for species with more than one sighting
2. Default sort: **Most recently spotted** (newest first)
3. Section headers based on capture recency. The exact headers adapt to collection size:
   - For collections under ~30 species: "Recent" (last 7 days) and "Earlier"
   - For larger collections: "This week," "This month," "Earlier this year," "Older"
4. Search bar above the grid filters by species name
5. Filter chips below search: Species type, Habitat, Conservation status, Date range
6. Sort menu (accessible from a small affordance in the filter row): Recently spotted (default), Alphabetical, Conservation rarity, Family
7. Tap a card → opens Card detail (§6.9)

**All North America view (Pokédex)**

1. Full catalog of all 900 NA species. Spotted species render as normal thumbnails; unspotted species render as locked silhouettes (dashed border, lock icon, no name visible)
2. Grouped by habitat (the 9 habitats from §7.2) with per-group progress in the section header: "Forests · 15 of 92," "Wetlands · 4 of 33," "Cities & towns · 8 of 23," etc.
3. Section headers are tappable to collapse/expand each habitat — helps manage the visual weight of 900 cells
4. Tapping a spotted thumbnail → Card detail (§6.9, spotted variant)
5. Tapping a locked silhouette → Card detail (§6.9, unspotted variant) — shows canonical info, no personal data, with a "Photograph this species" CTA that switches to the Capture tab

**Common elements**

- **Sighting count badge** (★N) appears on thumbnails for species the user has spotted more than once. Single-sighting cards don't show the badge — keeps the grid quiet.
- **Empty state** (no captures yet, Spotted view): hero illustration of binoculars + "Photograph your first bird" copy + a CTA that switches to the Capture tab. The All North America toggle is hidden on the empty state to avoid leading new users into an overwhelming view.

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
5. **Settled state** — Background returns to cream. Card scales down slightly. Bonus chips animate in below the card: streak increment, any family-collector progress, any other achievements unlocked. Two CTAs: "Continue" (back to viewfinder, ready for next shot) or "View card" (deep-link to Collection card detail).

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

**Top app bar.** Back arrow on the left, species common name in the center, action menu (...) on the right.

**Sections, in order, top to bottom**

1. **The card itself** — the full Cardinal-style card (frame color by rarity, taxonomy tag, habitat pill, hero photo, About copy, First Sight metadata, footer badges with conservation status / audio play / personal sighting count). Two interactive elements live on the card:
   - **Habitat pill** — tap to flip the hero region to the species' illustrated range map (see §7.1, "Habitat pill flip")
   - **Audio badge** — tap to play the species' call
2. **Quick stats trio** — three small metric cards in a row:
   - Sightings (e.g., 7)
   - First spotted (e.g., Jan 15)
   - Last spotted (e.g., Yesterday)
3. **Recent sightings** — the 2–3 most recent entries in the user's sightings log for this species. Each row: small photo thumbnail, date + time, location label, chevron. "View all N sightings" link at the top right opens the full sightings log screen.
4. **Your sightings map** — interactive Mapbox-styled map (per §18.3) with coral pins for every personal sighting of this species. Tap a pin to surface a small sighting preview (date, location, photo).

There is intentionally no separate "Range" section on this screen — the range map is reached via the habitat pill flip on the card itself (§7.1). This keeps the card the central artifact and the detail screen short.

**Action menu (...)** — v1 contains only:
- "Report incorrect ID" (for when the user thinks the species is wrong)

Card sharing/export is deferred to v2 (per §4). Delete or edit of First Sight metadata is pending §15 resolution.

**Unspotted variant** — reached by tapping a locked silhouette in the All North America view. Same screen structure with content swapped:
- Canonical species illustration (from the curated DB) in place of the user's photo
- The card frame and footer still render, but the personal sighting count badge reads "★ 0"
- No quick stats (no captures yet — collapsed or hidden)
- Range and habitat info shown as on the spotted version
- No sightings log, no personal map
- Sticky bottom CTA: "Photograph this species" — switches to the Capture tab

### 6.10 Profile home

For v1, Profile is a single combined screen — no separate Settings page. Everything the user can configure or access about themselves lives in one scrollable surface. This keeps the v1 surface minimal and matches the casual-first product pillar.

**Top bar.** Title "Profile" on the left. No gear icon (no separate Settings screen in v1).

**Sections, in order, top to bottom**

1. **Identity block** — circular avatar + display name + "Birding since [month year]"
   - Avatar source: the OAuth provider's profile image (Google sign-in returns one; Apple sign-in does not). If no provider avatar is present, fall back to a sage-tinted circle with the user's first initial.
   - Display name: the user's first name (from OAuth profile or email-derived). No handles in v1; users are not searchable.
2. **Stats trio** — three color-tinted tiles in a single row:
   - **Species** (sage tint, sage number) — total distinct species collected
   - **Streak** (coral tint, coral number) — current streak count
   - **Captures** (neutral tint) — lifetime count of successful captures including repeats
3. **Subscription** — visual depends on plan:
   - Free: saffron-tinted card ("Try birdr+" headline, "Unlimited captures, member perks" subline, dark-pill "Upgrade" CTA).
   - Subscriber: smaller "birdr+ Member · Manage" row, neutral background. Tapping opens the Subscription screen in manage mode.
4. **Activity** — three rows each linking to a sub-screen:
   - Achievements (icon: trophy; meta: "14 of 160 unlocked")
   - Streak history (icon: flame; meta: "Current: 12 · Longest: 28")
   - Sightings map (icon: map pin; meta: "134 captures · 3 states")
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

### 6.11 Delete account flow

Required by App Store policy. Two-step destructive confirmation to prevent accidental deletion.

1. User taps "Delete account" on Profile home.
2. **Step 1 alert**: "Delete your account? This will permanently delete your account, all your collected species cards, sightings, photos, achievements, and streak history. This cannot be undone." With "Cancel" and "Continue" buttons.
3. **Step 2 alert** (if user continued): "Type DELETE to confirm" — text input field. The "Delete account" button stays disabled until the user types DELETE exactly.
4. On confirm: the client calls a Supabase Edge Function that revokes the user's auth tokens, deletes all of the user's rows from `users`, `customer_accounts`, `sightings`, `cards`, `streaks`, and `achievements`, and removes all user-uploaded photos from storage.
5. User is signed out and returned to the welcome screen.

No grace period or soft-delete in v1 — deletion is immediate and irreversible. (v1.1 candidate: 30-day grace period with the option to restore from a "deletion pending" state, which is friendlier to users who change their mind.)

### 6.12 Subscription screen and hard paywall

Same screen content, two presentation modes:

- **Subscription screen** — reached from the Profile home subscription banner (free) or row (subscriber), or any other in-app upsell. Has the standard nav header with back arrow.
   - For free users: shows the tier picker (Yearly $29.99 with "BEST VALUE" badge first, Weekly $3.99 below) + the "Unlimited captures" value prop + a forward-looking "And more coming soon" pitch + Restore purchases link.
   - For subscribers: shows current plan, renewal date, "Manage subscription" (deep-link to RevenueCat customer portal or App Store/Play subscription management), and Restore purchases.
- **Hard paywall** — same content, presented as a fullscreen modal (no tab bar, close X in the corner instead of a back arrow). Triggered when a free user taps the central Capture button on the Capture hub while at zero remaining daily ID quota. Dismissing the modal returns to the Capture hub; subscribing dismisses it and immediately re-opens the capture flow.

The Capture hub displays the daily quota indicator ("2 of 3 captures left today") so users aren't surprised by the paywall. The Capture button is not disabled at zero quota — tapping it surfaces the paywall, not a silent no-op.

## 7. The bird card

The bird card is the central artifact of the app. Each species the user has photographed gets exactly one card per user.

### 7.1 Card anatomy (from the design reference)

**Top region**

- Family/order tag (small, e.g., "Songbird") top-left
- Common name (large, bold) below the family tag
- Habitat pill top-right (e.g., "Forests") with location pin icon — **tappable on the Card detail screen** to flip the hero region to the species' range map (see "Habitat pill flip" below)

**Hero region**

- User's photo cropped to the bird, framed by the same color as the card border
- Tapping the habitat pill flips this region in place to reveal the species' illustrated range map (see "Habitat pill flip" below)

**Habitat pill flip (Card detail only)**

Tapping the habitat pill on the Card detail screen triggers a 3D flip animation (Y-axis, ~500ms with a soft ease) on the hero region:

- Front state: the user's photo of the bird (default)
- Back state: the species' illustrated range map (the asset from §13.3)

The pill itself swaps to an active visual state on the back side (filled dark background with the saffron pill text) so users can clearly see they're on the "range view." A small "Range" label and a one-word range-summary caption (e.g., "Year-round," "Summer only," "Winter only") overlay the map for context.

Tap the pill again to flip back to the bird photo. The interaction is gated to the Card detail screen — on Collection grid thumbnails and Capture hub recents, the pill is informational only and not tappable; tapping the thumbnail still opens the full Card detail.

This replaces what would otherwise be a separate "Range" section on the Card detail screen, keeping the card itself the central artifact and the detail screen tighter.

**Body region** (three labeled fields)

- **Size:** Approximate length, imperial + metric
- **About:** Short editorial description, ~2–3 sentences, from the curated DB
- **First Sight:** Date + location label of the user's first sighting of this species

**Footer region**

- Conservation status circular badge (left): LC / NT / VU / EN / CR, IUCN-standard color coding
- Audio play button (center): plays the species' primary call/song
- Personal sighting count badge (right): displays the number of times the user has personally photographed this species. Small star icon + number (e.g., "★ 7"). Tracks engagement with the bird itself rather than family collection progress.
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

Reached from Profile → Achievements. Three screens.

**Hub screen** (default):

1. **Overall progress card** at the top — total unlocked / total achievements with a progress bar (e.g., "14 of 120 · 12% complete")
2. **Recently unlocked** — list of the 1–3 most recent unlocks with relative timestamps ("Unlocked yesterday")
3. **Categories** — 5 cards (Collection, Streaks, Regional, Family masters, Habitat masters), each with a category icon, name, "X of Y" count, and a progress bar tinted in the category's accent color

Category accent colors:
- Collection: sage
- Streaks: coral
- Regional: sky blue
- Family masters: purple
- Habitat masters: teal (a complementary accent — TBD against the full palette)

**Section detail screen** (tapping a category card):

- Back arrow + category name in the top bar
- One-line description of the category
- List of achievements sorted: in-progress at top, locked next, unlocked at the bottom under a divider
- Each row: status icon (filled check for unlocked, lock for locked, partial-fill for in-progress), name, and either "Earned [date]" / progress bar / criteria

**Achievement detail (inline expansion)** — tapping a row expands it inline rather than navigating to a new screen. Shows the full description, criteria, related achievements (next tier), and a Lottie-animated badge if unlocked. Keeps the screen count small and the interaction snappy.

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

Use RevenueCat per `documentation/subscription-pattern.md`. Store API keys in ConfigCat per `documentation/configcat-pattern.md`. Track purchase events in PostHog per `documentation/posthog-pattern.md`.

## 12. Technical architecture

birdr inherits the engineering patterns documented in `documentation/`. Reuse without modification where possible.

### 12.1 Frontend

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation per `navigation-pattern.md` — four-tab bottom-tab navigator with stack navigators inside each tab
- Atomic design system per `atomic-design-pattern.md` and `atomic-design-extended-atoms.md`
- Haptic feedback per `haptic-feedback-pattern.md`
- Auth: Supabase Auth with Apple and Google OAuth providers only (no email/password in v1)
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
- Account deletion flow per App Store requirements — accessible from Profile home as a destructive action with a two-step confirmation; immediate hard delete, no grace period in v1 (see §6.11)

### 14.3 Future-proofing for social

When v2 introduces social features, public-facing sighting locations must be fuzzed (round to nearest named place ≥1 km radius) to protect users from accidentally revealing home addresses. The schema should support both `precise_lat/lon` (private) and `display_location` (public, fuzzed) from v1.

## 15. Open questions

1. **Audio button UX on card:** Single tap-to-play, or expandable selector for song/call/alarm-call?
2. **Card flip vs. detail screen:** Does the card flip to reveal a sightings log, or is the log a separate detail view?
3. **First Sight permanence:** Frozen forever, or editable?
4. **ID provider final pick:** Lock Gemini Flash or evaluate Merlin/iNat ToS for commercial use?
5. **Onboarding length:** How many tutorial screens before dropping into the app?
6. **Notification defaults:** Default reminder time, user customization scope
7. **Explore radius default:** 25 km is a guess. Should users be able to adjust it? Does urban vs. rural location warrant different defaults?
8. **eBird commercial terms:** Confirm commercial-use viability before building Explore on top of it. Identify fallback if blocked.
9. **Capture tab when launching camera mid-session:** When the user has the camera modal open and dismisses it, do they return to a fresh hub or the previous in-progress capture? (Working answer: dismiss = abandon; return to fresh hub.)
10. **Explore "target species" save:** Should v1 include a "save as target" interaction on Explore species, or is that a v1.1 add?
11. **Rarity gradient exact stops:** Working defaults are LC=saffron, NT=light orange, VU=coral, EN=terracotta, CR=burgundy. Validate against the full palette and the look of common species frames.

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

### 18.4 Typography

**Plus Jakarta Sans** (Google Fonts, free, OFL) for the entire app — body, UI, and display. Used at multiple weights:

- Regular (400) for body copy and supporting text
- Medium (500) for titles, section headers, button labels, card names ("Cardinal")
- Tabular figures enabled globally so stat numbers (streak count, sighting count, species totals) stay vertically aligned

Plus Jakarta Sans was chosen for its slightly warm, friendly character that complements the field-guide aesthetic without becoming twee. No serif in v1 — saves a font load and avoids a "vintage taxidermy" feel.

### 18.5 Iconography

**Lucide** (free, ISC license) as the primary icon set. Outline-only style, consistent with the field-guide aesthetic. Used for tab bar, action buttons, list affordances, settings.

Candidates for custom-drawn treatment (out of scope for v1, candidates for v1.1 polish):

- The four tab icons (Capture, Collection, Explore, Profile) — a custom binoculars / book / compass / user set would add personality
- Conservation status badges — IUCN codes lend themselves to a custom badge treatment that reads more credibly than generic shapes
- The streak chip / flame — Brandon is providing a custom animation for this

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
