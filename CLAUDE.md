# CLAUDE.md — birdr engineering context

This file orients Claude Code (or any agent) on the birdr project. It captures what's locked, what's open, where to find detail, and how to make progress without constantly asking the human.

## Project at a glance

birdr is a mobile app for casual bird watchers. The core loop: take a photo of a bird → cloud AI identifies the species → the photo becomes a polished collectible card (Pokémon-style) that joins the user's personal Pokédex. Engagement layers on top: streaks, achievements across 5 categories, an Explore tab for what's around the user, and a Profile tab.

Current state: **product spec complete, engineering not yet started.** No code exists in `app/` or `functions/` yet — they are empty placeholders. The product spec is fully documented (~1100 lines) in [`documentation/product-requirements.md`](./documentation/product-requirements.md).

The PRD is the source of truth. This file is meta-context — it points you at the PRD and captures engineering-level decisions, conventions, and what to do next.

## Repo layout

```
birdr/
├── app/                    # Mobile app (React Native + Expo)        ← empty
├── functions/              # Supabase Edge Functions (Deno)          ← empty
├── documentation/          # PRD + reusable engineering pattern docs ← populated
├── CLAUDE.md               # This file
├── README.md
└── .gitignore
```

`documentation/` contains the PRD plus 14 reusable engineering pattern docs from a previous project. They cover auth, navigation, atomic design, haptics, analytics (PostHog), error tracking (Sentry), feature flags (ConfigCat), subscriptions (RevenueCat), edge functions, E2E testing (Maestro), and uploads. They have been pre-screened for relevance — every doc in there applies to birdr. **Use them.** They contain copy-paste-ready code examples that should be reused with light adaptation.

## Read order for first session

1. **`documentation/product-requirements.md`** — read fully. It's the only document that is canonical.
2. **`documentation/README.md`** — the index of pattern docs. Skim it to know what's available.
3. This file (CLAUDE.md) — for engineering-specific conventions and roadmap.
4. Individual pattern docs **as you need them** for specific work (auth flow, subscription wiring, etc.).

## Tech stack — locked

These decisions are made. Don't re-litigate without surfacing to the human first.

**Mobile app (`app/`)**
- React Native + Expo (managed workflow)
- TypeScript
- React Navigation — four-tab bottom-tab navigator with stack navigators inside each tab (Capture / Collection / Explore / Profile, Capture is default)
- Atomic design system per `documentation/atomic-design-pattern.md` — every component must have `testID`
- Haptic feedback per `documentation/haptic-feedback-pattern.md`
- Plus Jakarta Sans typography (Google Fonts, OFL) — Regular (400) and Medium (500); tabular figures enabled globally
- Lucide icons — outline style; custom-drawn tab icons + conservation badges deferred to v1.1
- Map rendering: Mapbox or MapLibre with a custom style tuned to brand palette (see §18.3 of PRD). Specific choice still open — see below.

**Backend (`functions/`)**
- Supabase: Auth, Postgres, Edge Functions (Deno), Storage
- Supabase Auth providers: **Apple and Google OAuth only** (no email/password in v1)
- Edge Function pattern per `documentation/EDGE-FUNCTION.md` — photo+location in, ranked species candidates out
- Server-side streak validation (timezone-tamper-resistant)
- Server-side daily ID quota enforcement (the cap is the gate; client is just UX)

**Services**
- Sentry — error tracking (`sentry-pattern.md`)
- PostHog — product analytics (`posthog-pattern.md`)
- ConfigCat — feature flags + remote config (`configcat-pattern.md`)
- RevenueCat — subscriptions (`subscription-pattern.md`)
- eBird API — for Explore tab; **aggregate species frequency endpoints only**, no real-time observations feed in v1

**Brand**
- Color palette: sage primary, saffron accent, coral warmth, robin-egg blue, cream surfaces, charcoal text (see PRD §18.1)
- Card frame color = IUCN rarity tier (LC=saffron, NT=light orange, VU=coral, EN=terracotta, CR=burgundy)
- Map style for interactive maps: hand-tuned Mapbox/MapLibre custom style approximating the brand palette
- Per-species range maps: static illustrated PNG/SVG assets generated via the pipeline in §13.3 (hand-illustrated base + scripted range overlay)

## Tech stack — open (surface to human before deciding)

**Cloud ID provider — biggest open technical decision.** Candidates:
- Gemini Flash (Google) — fast, cheap (~$0.01–$0.03/call), strong general vision. Likely the cost/accuracy sweet spot.
- Cornell Lab Merlin — bird-specialized, gold-standard accuracy. Commercial API not openly available; requires partnership.
- iNaturalist Computer Vision — bird-specialized, strong accuracy. ToS restricts commercial use; legal review needed.
- Custom fine-tuned model — train on iNaturalist Open Dataset. Highest accuracy ceiling, lowest unit cost at scale, but adds months of pre-launch ML work.

This decision affects unit economics, accuracy, and the engineering scope of `functions/`. The human wants a thorough evaluation. Don't lock this without input.

**Mapbox vs MapLibre.** Both can render the custom brand-styled tiles. Mapbox is more polished, has a small per-MAU fee. MapLibre is fully open-source, no fees, slightly rougher edges. Decision depends on free-tier birdr economics. Surface to human.

**App Store name and final brand name.** Currently "birdr" as working title. Trademark and store-name availability not yet checked. Don't ship anything user-facing assuming the name is final.

## Engineering roadmap (suggested phase order)

Numbered phases that can roughly be tackled in order. Many can be parallelized — the human wants async progress, so when a phase blocks on a decision, work the next-unblocked phase rather than waiting.

**Phase 0 — Project scaffolding (low-risk, do first)**

- Expo init the mobile app in `app/` with TypeScript template
- Initialize Supabase project; wire up auth, Postgres, edge functions
- Configure Sentry, PostHog, ConfigCat, RevenueCat per their pattern docs
- Set up React Navigation with the four-tab structure
- Stub the four tab screens with placeholder content
- Wire up the provider hierarchy per the pattern doc order (Sentry > Navigation > PostHog > Auth > Config > Subscription > HapticFeedback > App)
- Add Plus Jakarta Sans and Lucide icons
- Set up Maestro for E2E testing per `e2e-testing-pattern.md`

**Phase 1 — Database schema and core data model**

Per PRD §12.4, the core tables are:

- `species` (~900 NA species; includes species_type and primary_habitat enums)
- `species_assets` (audio, range maps, illustrations)
- `users` (Supabase auth users)
- `customer_accounts` (backend customer records keyed by user_id)
- `sightings` (per-capture event with photo_url, captured_at, lat, lon, named_location)
- `cards` (per-user-per-species aggregate; first_seen_at, last_seen_at, sighting_count, hero_photo_url)
- `streaks` (current/longest/last_capture_date)
- `achievements` (achievement_id, unlocked_at, progress)
- `ebird_cache` (short-TTL cache of eBird responses)

Important schema notes:
- `sightings.lat/lon` precise; add a `display_location` field now even though v1 doesn't use it publicly (avoids painful migration when social features arrive in v2 — see PRD §14.3)
- Daily ID quota enforced server-side; track in `customer_accounts` or a dedicated `daily_quota` table

**Phase 2 — Auth flow**

Per `documentation/authentication-pattern.md`. Apple + Google OAuth only. Sign-in screen as the entry point after the welcome carousel; permission rationale screen after sign-in. See PRD §6.1 for the full onboarding spec.

**Phase 3 — The vertical slice: Capture → Cloud ID → Card**

This is the headline loop. Build it end-to-end as the first real feature, even if it's ugly:

1. Capture hub screen with shutter button and daily quota indicator
2. Camera viewfinder (per PRD §6.13) — fullscreen modal, hides tab bar
3. Photo preview (per §6.14)
4. Upload to cloud ID edge function
5. Branch on confidence (per §6.2 step 7 and §6.8)
6. Card unlock reveal animation (per §6.7) — 5 beats, Reanimated + Lottie
7. New card persisted in `cards` table; sighting in `sightings`

Once this works end-to-end, the rest of the app is connecting the dots.

**Phase 4 — Collection grid + card detail**

Per PRD §6.3 and §6.9. Includes the habitat pill flip interaction (§7.1) that swaps the hero photo with the species range map on tap.

**Phase 5 — Streaks**

Per PRD §6.6 and §9. Server-side validation. Daily streak reminder push notification at 6pm local (default; no user customization in v1).

**Phase 6 — Achievements**

Per PRD §10. 5 categories, ~160 total achievements. The 5-tier mastery progression (Spotter/Apprentice/Adept/Expert/Master at 5/10/25/50/100%) applies to both family and habitat masters.

**Phase 7 — Subscription + paywall**

Per RevenueCat pattern doc and PRD §11. Hard paywall when free user hits the 3/day cap; subscription banner on Profile home for free users.

**Phase 8 — Explore**

Per PRD §6.4. Three modes: Near me, Region, My map. **No real-time observation feed in v1** — uses eBird aggregate species frequency data only.

**Phase 9 — Profile + delete account**

Per PRD §6.10 and §6.11. Single combined screen — no separate settings page in v1.

**Phase 10 — Polish + beta**

E2E test coverage for critical flows. Beta with 20–50 casual bird watchers before public launch.

## Things to know that aren't obvious from the PRD

The PRD is detailed but a few things are worth pulling forward for engineering:

**The capture flow lives outside the tab bar.** When the user taps the central capture button on the Capture hub, the camera launches as a fullscreen modal — tab bar hidden, X close in the corner. Same goes for the photo preview and the card unlock reveal. Returning to the Capture hub restores the tab bar. Engineering-wise this is a stack-on-top-of-tabs navigation pattern — see `documentation/navigation-pattern.md` for the conditional flow pattern.

**The daily quota is server-enforced, not just client.** The Capture hub displays "X of 3 captures left today" as UX, but the actual gate is on the cloud ID edge function — it returns a 402-style "quota exceeded" if a free user is over their limit. The client surfaces the hard paywall on receipt of that error. This is the tamper-resistant gate.

**The card unlock reveal has rarity-aware intensity scaling** (PRD §6.7). Same core animation, different particle counts / colors / durations / haptic strengths based on conservation tier. Implementation: one Lottie per rarity tier (5 files), Reanimated for card scale/position, haptic-feedback-pattern doc for the tactile cues.

**Multi-unlock achievements queue and auto-play** (PRD §10.7). After the card reveal completes, achievement celebrations play sequentially with tap-to-dismiss. Priority order: Master > Expert > Adept > Apprentice > Spotter, then non-mastery achievements (streak, collection milestone, regional first).

**Streak rollover achievements fire asynchronously.** When a user crosses a streak threshold at midnight (server time, user-local), there's no in-app moment. Push notification fires; tapping it opens the celebration on next launch. Server-side cron job needed (or scheduled edge function) at user-local midnight.

**The species DB needs ~160 achievement targets baked in.** When implementing achievements, the criteria for each tier (Spotter=5%, Apprentice=10%, etc.) need to compute against the actual species count per family/habitat. Don't hardcode the thresholds — compute them from the curated DB so they stay accurate as the DB evolves.

**The habitat pill on the card detail is interactive.** Tapping it flips the hero region (3D Y-axis, ~500ms) from the user's photo to the species range map. The pill swaps to an active state when on the back. This is a Reanimated animation — see PRD §7.1.

**Asset pipelines you'll need to coordinate with the human:**

- 1 hand-illustrated base North America map (for range map generation)
- A scripted process to overlay eBird/BirdLife range polygons onto the base map per species (~900 outputs)
- 9 habitat scene illustrations (forest, grassland, desert, wetland, freshwater, coast, mountain, tundra, urban)
- A Mapbox or MapLibre custom style file tuned to the brand palette
- ~900 species DB entries: taxonomy, conservation status, size, About copy (~2-3 sentences), distinguishing-feature line (5-8 words; for the top-3 picker), audio call sourcing
- 5 Lottie files for the rarity-tier card reveal particles
- 1 Lottie for the achievement unlock burst

The human is providing some of these (habitat scenes, possibly the base map). The DB curation is the single biggest content task — estimated 2–3 focused months.

## Product principles (these inform technical decisions)

From PRD §3:

1. **The capture loop is the product.** Everything else serves it. If a feature breaks the loop, kill the feature.
2. **Real data, real credibility.** No fictional species, no hallucinated facts. IUCN conservation status, real bird audio (xeno-canto), accurate ranges.
3. **Casual-first.** A user who opens the app once a week should still feel rewarded. The 5-tier mastery curve is designed for this; so is the strict-streak + 3-day-tier accessibility.
4. **Personal, not social.** v1 is a private museum. No friends, feeds, leaderboards, sharing, or comments.

## Conventions

**Commits.** Use conventional-style commit messages with detailed body. Look at `git log --oneline` for the style — short subject line + structured body explaining intent, what changed, and why.

**TestID on every component.** Atomic design system requirement. E2E tests depend on it.

**No silent failures.** Cloud calls (ID, eBird, payment) need explicit error states surfaced to the user — see PRD §6.13 (camera permission), §11.3 (paywall), §13.2 (eBird).

**Respect Reduce Motion.** Card unlock reveal and achievement celebrations both have reduced-motion variants per §6.7 and §10.7. Particle bursts collapse to static accents; flip animations cross-fade.

**Server is source of truth.** Daily quotas, streak validity, achievement unlocks all validated server-side. Client renders state but doesn't gate.

**Branch on tags, not strings.** Conservation status, species type, habitat — all are enums in the DB. Don't switch on display strings.

## What NOT to decide unilaterally

These are open product/UX decisions that the human owns:

- Cloud ID provider final pick
- Specific pixel values for the brand palette (current hexes in §18.1 are anchors, not final tokens)
- Pricing changes — pricing is locked at $3.99/wk and $29.99/yr; don't quietly tune
- Anything in PRD §15 Open questions
- Anything that changes a behavior the PRD specifies as locked (4-tab nav, OAuth-only, 5-tier mastery, etc.)

## PRD §15 Open questions reference

These are explicit unknowns from the PRD that may surface as you build. Don't decide them without checking in:

1. Audio button UX on card — single tap vs expandable selector
2. First Sight permanence — frozen or editable
3. ID provider final pick (above)
4. Onboarding length — tutorial screens count
5. Notification defaults — reminder time + customization scope
6. Explore "Near me" scope — fixed county vs adjustable
7. eBird aggregate API commercial terms
8. Capture tab when launching camera mid-session — fresh hub or resume
9. Explore "target species" save — v1 or v1.1
10. Rarity gradient exact stops

## When in doubt

Read the PRD section that's most relevant to what you're building. If it's still unclear, ask the human via PR comment or chat. Do not make a guess and ship it.

## Asynchronous work guidance

The human is iterating on product in parallel with engineering. They want background progress. So:

- Pick work that's unblocked. If Phase 3 is blocked on the ID provider decision, work Phase 4 or 5.
- Commit early, commit often. Many small commits beat one giant PR.
- Surface decisions via TODO comments tagged `// TODO(birdr): decide [thing]` so the human can find them.
- Keep `app/CLAUDE.md` and `functions/CLAUDE.md` (when they exist) updated with sub-project-specific context as you scaffold.
- Don't refactor the pattern docs in `documentation/` — they're conventions, treat them as read-only references.

---

**Last updated:** 2026-05-22

**Next session pickup point:** Phase 0 — Project scaffolding. Start with `app/` (Expo init) and `functions/` (Supabase project init).
