# CLAUDE.md — birdr engineering context

This file orients Claude Code (or any agent) on the birdr project. It captures what's locked, what's open, where to find detail, and how to make progress without constantly asking the human.

## Project at a glance

birdr is a mobile app for casual bird watchers. The core loop: take a photo of a bird → cloud AI identifies the species → the photo becomes a polished collectible card (Pokémon-style) that joins the user's personal Pokédex. Engagement layers on top: streaks, achievements across 4 categories, an Explore tab for what's around the user, and a Profile tab.

Current state: **product spec and technical design complete, engineering not yet started.** No code exists in `app/` or `functions/` yet — they are empty placeholders. The product spec and technical architecture are fully documented in [`documentation/product-requirements.md`](./documentation/product-requirements.md) (§12 covers the full technical design).

The PRD is the source of truth. This file is meta-context — it points you at the PRD and captures engineering-level decisions, conventions, and what to do next.

## Repo layout

```
birdr/
├── app/                    # Mobile app (React Native + Expo)        ← empty
├── functions/              # Supabase Edge Functions (Deno)          ← empty
├── documentation/          # PRD + reusable engineering pattern docs ← populated
│   └── design/             # Hi-fi HTML/CSS/JS design prototypes (reference, not production code)
├── CLAUDE.md               # This file
├── README.md
└── .gitignore
```

`documentation/` contains the PRD plus reusable engineering pattern docs from a previous project. They cover auth, navigation, atomic design, haptics, analytics (PostHog), subscriptions (RevenueCat), edge functions, and uploads. **Use them.** They contain copy-paste-ready code examples that should be reused with light adaptation.

`documentation/design/` contains hi-fi HTML/CSS/JS design prototypes from Claude Design. These are **reference files** — match their visual output in React Native, don't copy their internal structure. Key files:
- `tokens.jsx` — design tokens (colors, shadows, font config)
- `card.jsx` — BirdCard + BirdCardThumb components
- `chrome.jsx` — TabBar, PrimaryButton, SegmentedControl, Pill, etc.
- `screens-*.jsx` — screen layouts for each tab
- `screenshots/` — visual reference images

Note: Pattern docs for Sentry, ConfigCat, and Maestro exist in `documentation/` but are **not used in v1** — ignore them.

## Read order for first session

1. **`documentation/product-requirements.md`** — read fully. §12 has the complete technical architecture (schema, edge functions, indexes, caching, IoC provider pattern).
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
- Three edge functions (see §12.2 of PRD for full specs):
  - `identify-bird` — quota check → GPT-4o vision API → return species candidates
  - `confirm-sighting` — persist sighting → lazy streak update → scoped achievement evaluation → return full state
  - `explore-species` — lat/lon → state resolution → species list with seasonality + spotted status
  - `delete-account` — hard delete all user data, photos, and auth record
- Bird ID provider: **GPT-4o** via IoC adapter pattern (`BirdIdProvider` interface). Swappable via env var.
- Auth: Apple + Google OAuth only. Profile + streaks rows created via DB trigger on `auth.users` insert. All edge functions extract user from JWT — no client-sent user IDs trusted.
- Server-side streak validation (lazy — no cron job, computed on capture)
- Server-side daily ID quota enforcement (the cap is the gate; client is just UX)
- Photo upload to Supabase storage happens **after** bird is confirmed, not before

**Services**
- PostHog — product analytics (`posthog-pattern.md`)
- RevenueCat — subscriptions (`subscription-pattern.md`)
- OpenAI API (GPT-4o) — bird identification via vision API

**Not in v1** (pattern docs exist but ignore them):
- Sentry (error tracking) — deferred
- ConfigCat (feature flags) — deferred
- Maestro (E2E testing) — deferred
- eBird API (runtime) — no live API dependency; Explore tab served from our own `species_regions` table
- Range maps — deferred until licensing sorted
- Regional/geographic achievements — deferred to v2

**Brand (Vivid/Mint theme — v1 default)**
- Primary: teal `#008D8F`, gradient to `#5DC79C`
- Surfaces: pale mint `#EAF5E5`, paper `#DDEED7`, card body `#FBF9EF`
- Accent: warm amber `#FFB347`
- Coral: vermillion `#E84B4B` (streaks, destructive)
- Sky: cyan-teal `#4FBDC0`
- Ink: dark teal-charcoal `#1B3937`
- Card frame color = IUCN rarity tier (LC=`#EFC027`, NT=`#E89A3B`, VU=`#D85A30`, EN=`#A53A1F`, CR=`#6B1A12`)
- Full token reference in `documentation/design/tokens.jsx` and PRD §18.1
- Map style: Mapbox/MapLibre with teal-sage gradient land, cyan-teal water, coral pins

## Tech stack — open (surface to human before deciding)

**Mapbox vs MapLibre.** Both can render the custom brand-styled tiles. Mapbox is more polished, has a small per-MAU fee. MapLibre is fully open-source, no fees, slightly rougher edges. Decision depends on free-tier birdr economics. Surface to human.

**App Store name and final brand name.** Currently "birdr" as working title. Trademark and store-name availability not yet checked. Don't ship anything user-facing assuming the name is final.

## Database schema (quick reference)

Full schema with columns, types, and indexes is in PRD §12.4. Here's the summary:

**11 tables/views total:**

| Table | Type | Purpose |
|---|---|---|
| `species_types` | Lookup | Bird type categories (9 types) |
| `habitats` | Lookup | Habitat categories (9 habitats) |
| `species` | Reference | ~900 NA bird species |
| `species_audio` | Reference | Audio file refs per species |
| `species_regions` | Reference | State-level seasonality + frequency (~45k rows, hydrated from eBird bulk downloads) |
| `species_illustrations` | Reference | Illustration refs per species |
| `profiles` | User data | Extends auth.users — display name, daily quota |
| `sightings` | User data | Every successful capture |
| `streaks` | User data | Current streak state (no history table) |
| `user_achievements` | User data | Progress + unlock state per achievement |
| `cards` | View | Derived from sightings — first/last seen, count, hero photo |

**Key design decisions:**
- `species_types` and `habitats` are separate lookup tables (not enums on species)
- `cards` is a Postgres view, not a table — hero photo is always the first sighting photo
- Streak logic is lazy (no cron job) — computed on capture
- Achievement definitions (~105) live in app/edge function code, not in the DB. Categories: collection milestones (9), streak tiers (6), family masters (45), habitat masters (45).
- `species_regions` is hydrated from eBird bulk downloads during development (see §13.2) — no runtime eBird API dependency
- `display_location` on sightings is added now for v2 social prep

**Device caching:** Species, species_types, habitats, species_audio, species_illustrations cached on-device after first launch. Sightings invalidated on capture with pagination. Everything else reads from Supabase directly.

## Edge functions (quick reference)

Full specs in PRD §12.2.

**Capture flow (two functions):**
1. `identify-bird` — receives image bytes + lat/lon. Checks quota, calls GPT-4o via IoC adapter, returns candidates. ≥85% → auto-accept. 60-85% → top-3 picker. <60% → retry. Quota consumed regardless.
2. `confirm-sighting` — receives confirmed species + uploaded photo path. Inserts sighting, updates streak (lazy), evaluates achievements (scoped to what changed). Returns full state for client animations.

**Explore:**
3. `explore-species` — receives lat/lon. Resolves to state code, queries `species_regions` joined to species + user sightings. Returns shaped list with seasonality + spotted status.

## Engineering roadmap (suggested phase order)

Many can be parallelized. When a phase blocks, work the next-unblocked phase.

**Phase 0 — Project scaffolding**
- Expo init in `app/` with TypeScript template
- Initialize Supabase project; wire up auth, Postgres, edge functions, storage buckets
- Configure PostHog, RevenueCat per their pattern docs
- Set up React Navigation with the four-tab structure
- Stub the four tab screens with placeholder content
- Wire up provider hierarchy: Navigation → PostHog → Auth → RevenueCat → HapticFeedback → App
- Add Plus Jakarta Sans and Lucide icons

**Phase 1 — Database schema**
- Create all tables per §12.4 (species_types, habitats, species, species_audio, species_regions, species_illustrations, profiles, sightings, streaks, user_achievements)
- Create the `cards` view
- Create all indexes per the index summary in §12.4
- Set up RLS policies
- Set up Supabase storage buckets for user photos and species assets

**Phase 2 — Species DB hydration**
- Run the hydration script per §13.2 (Clements taxonomy CSV → species table, eBird bar charts → species_regions)
- Seed species_types and habitats lookup tables
- This is partially manual curation work (about_text, distinguishing_feature, species_type/habitat mapping)

**Phase 3 — Auth flow**
- Per `documentation/authentication-pattern.md`. Apple + Google OAuth only.
- Welcome carousel → sign in → permission rationale → drop into Capture hub
- See PRD §6.1 for the full onboarding spec.

**Phase 4 — The vertical slice: Capture → Cloud ID → Card**
This is the headline loop. Build it end-to-end:
1. Capture hub screen with shutter button and daily quota indicator
2. Camera viewfinder (fullscreen modal, hides tab bar)
3. Photo preview
4. Call `identify-bird` edge function with image bytes
5. Branch on confidence (auto-accept / top-3 picker / retry)
6. On confirm: upload photo to Supabase storage, call `confirm-sighting`
7. Card unlock reveal animation (5 beats, Reanimated + Lottie)
8. Achievement celebrations queue

**Phase 5 — Collection grid + card detail**
- Per PRD §6.3 and §6.9.
- Habitat pill flip interaction (§7.1) — but flips to illustration/info, NOT range map (deferred from v1)

**Phase 6 — Streaks**
- Per PRD §6.6 and §9. Server-side lazy validation.
- Streak detail screen: current, longest, total days, 60-day calendar (derived from sightings)
- Push notification at 6pm local if no capture yet

**Phase 7 — Achievements**
- Per PRD §10. 4 categories, ~105 total (regional deferred to v2).
- Achievement definitions in app code as TypeScript constants
- Achievement evaluation in `confirm-sighting` edge function
- Achievement hub UI in Profile tab

**Phase 8 — Subscription + paywall**
- Per RevenueCat pattern doc and PRD §11.
- Hard paywall when `identify-bird` returns `402 quota_exceeded`
- Subscription banner on Profile home for free users

**Phase 9 — Explore**
- Per PRD §6.4. Two modes: Near me + My map (Region removed from v1).
- Near me served by `explore-species` edge function (state-level, our own data)
- My map is user's sightings on an interactive map (Mapbox/MapLibre)

**Phase 10 — Profile + delete account**
- Per PRD §6.10 and §6.11. Single combined screen.

**Phase 11 — Polish + beta**
- Beta with 20–50 casual bird watchers before public launch.

## Things to know that aren't obvious from the PRD

**The capture flow lives outside the tab bar.** Camera launches as a fullscreen modal — tab bar hidden, X close in the corner. Stack-on-top-of-tabs navigation pattern — see `documentation/navigation-pattern.md`.

**Photo upload timing.** The photo is NOT uploaded when the user hits "Identify." The image bytes go directly to `identify-bird`. Only after the species is confirmed does the client upload to Supabase storage, then call `confirm-sighting` with the storage path. This avoids storing photos for failed/rejected IDs.

**The daily quota is server-enforced, not just client.** The `identify-bird` edge function returns `402 quota_exceeded` when a free user is over their limit. The client surfaces the hard paywall on receipt of that error.

**Achievement evaluation is scoped.** On a repeat species capture, only streak tiers are checked. On a First Sight, collection milestones + the relevant family tier + the relevant habitat tier are also checked. Not all 105 every time.

**Transaction safety in confirm-sighting.** Sighting insert + streak update are in a single transaction. Achievement evaluation runs after commit — if it fails, the sighting is still valid.

**Streak logic is lazy.** No cron job. The streak resets implicitly when the next capture detects a gap in `last_capture_date`. The "your streak ended" morning push notification reads state but doesn't mutate.

**The species DB needs computed achievement thresholds.** Family/habitat mastery tiers (Spotter=5%, etc.) compute against actual species counts per type/habitat. Don't hardcode — compute from the DB.

**Asset pipelines to coordinate with the human:**
- 9 habitat scene illustrations (forest, grassland, desert, wetland, freshwater, coast, mountain, tundra, urban)
- A Mapbox or MapLibre custom style file tuned to the brand palette
- ~900 species DB entries: taxonomy, conservation status, size, About copy, distinguishing-feature line, audio call sourcing
- 5 Lottie files for the rarity-tier card reveal particles
- 1 Lottie for the achievement unlock burst

## Product principles (these inform technical decisions)

From PRD §3:

1. **The capture loop is the product.** Everything else serves it.
2. **Real data, real credibility.** No fictional species, no hallucinated facts.
3. **Casual-first.** A user who opens the app once a week should still feel rewarded.
4. **Personal, not social.** v1 is a private museum.

## Conventions

**Commits.** Use conventional-style commit messages with detailed body.

**TestID on every component.** Atomic design system requirement.

**No silent failures.** Cloud calls (ID, payment) need explicit error states surfaced to the user.

**Respect Reduce Motion.** Card unlock reveal and achievement celebrations both have reduced-motion variants.

**Server is source of truth.** Daily quotas, streak validity, achievement unlocks all validated server-side.

**Branch on tags, not strings.** Conservation status, species type, habitat — all are enums in the DB.

## What NOT to decide unilaterally

- Specific pixel values for the brand palette (current hexes in §18.1 are anchors, not final tokens)
- Pricing changes — pricing is locked at $3.99/wk and $29.99/yr
- Anything in PRD §15 Open questions
- Anything that changes a behavior the PRD specifies as locked

## PRD §15 Open questions reference

1. Audio button UX on card — single tap vs expandable selector
2. First Sight permanence — frozen or editable (v1: frozen, uses first photo)
3. ~~ID provider final pick~~ — **decided: GPT-4o via IoC adapter**
4. Onboarding length — tutorial screens count
5. Notification defaults — reminder time + customization scope
6. ~~Explore "Near me" scope~~ — **decided: state-level for v1**
7. ~~eBird aggregate API commercial terms~~ — **resolved: no runtime API dependency, bulk download hydration only**
8. Capture tab when launching camera mid-session — fresh hub or resume
9. Explore "target species" save — deferred to v1.1
10. Rarity gradient exact stops

## When in doubt

Read the PRD section that's most relevant to what you're building. If it's still unclear, ask the human. Do not make a guess and ship it.

## Asynchronous work guidance

The human is iterating on product in parallel with engineering. They want background progress. So:

- Pick work that's unblocked.
- Commit early, commit often. Many small commits beat one giant PR.
- Surface decisions via TODO comments tagged `// TODO(birdr): decide [thing]` so the human can find them.
- Keep `app/CLAUDE.md` and `functions/CLAUDE.md` (when they exist) updated with sub-project-specific context as you scaffold.
- Don't refactor the pattern docs in `documentation/` — they're conventions, treat them as read-only references.

---

**Last updated:** 2026-05-23

**Next session pickup point:** Phase 0 — Project scaffolding, Phase 1 — Database schema, and Phase 2 — Species DB hydration are all unblocked and can be worked in parallel.

## Parallelizable work streams

The following can be run as independent sessions (separate terminals). Each session should work on its own git branch and be given one of these prompts:

### Stream A — Supabase schema + edge functions
Scope: Phase 1 + edge function stubs. Branch: `feat/supabase-schema`

### Stream B — Expo app scaffolding
Scope: Phase 0 (app side only). Branch: `feat/app-scaffold`

### Stream C — Species DB hydration script
Scope: Phase 2. Branch: `feat/species-hydration`
