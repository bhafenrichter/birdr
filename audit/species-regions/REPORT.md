# species_regions audit — 2026-06-09

Audit of the `species_regions` table in the Birdr - Development Supabase project
(`enctbzysromgremkqykc`) against real-world North American bird distribution.

## Method

- All 1,395 species with region rows were reviewed (in 14 batches of ~100) by
  expert-reviewer agents comparing each species' state list and season tags to
  its actual regular range at state-level granularity (eBird / field-guide level
  knowledge). Vagrant-only states were treated as errors.
- Structural SQL checks ran first (duplicates, state-code format, frequency
  range, orphaned species).
- Raw per-batch findings: `batch-01.json` … `batch-14.json`; merged file:
  `all-findings.json`.

## Headline result

**The data does not match reality and should be re-hydrated, not patched.**

| Verdict | Species | % |
|---|---|---|
| ok | 410 | 29% |
| minor_issues | 434 | 31% |
| major_issues | 550 | 39% |

Issue counts (a finding may cover many states): **833 wrong-state** issues,
**377 wrong-season** issues, 7 missing-state issues, across 978 flagged species.

## Systemic error patterns (evidence the data is LLM-generated, not eBird-derived)

1. **Blanket "all 49/50 states" listings** for range-restricted species.
   Examples: Roseate Spoonbill year-round in Minnesota; Atlantic Puffin
   year-round in Ohio and Florida; Brown Pelican year-round in ~26 interior
   states; Pacific Loon in all 50 states.
2. **Season tags wrong wholesale.** Neotropical migrants tagged `year_round`
   (Black Tern, Common Tern, Veery, Snow Goose, Broad-winged Hawk); sedentary
   residents tagged `summer` (Northern Cardinal in every state, Red-winged
   Blackbird, Boat-tailed Grackle); the iconic southern *winter* warbler
   (Yellow-rumped) tagged `summer`. The `rare` enum value is used in **zero**
   rows; `winter` in only 549 of 24,754.
3. **Exotics/cage-bird escapes listed as established wild residents** — Black
   Swan in ~38 states, Budgerigar in 44, Emu in 15, Red Junglefowl in 46,
   Blue-and-yellow Macaw, African estrildids/hornbills, etc.
4. **Species with zero US occurrence** — Echo Parakeet (Mauritius endemic) in
   Utah, Orange Bullfinch (Himalayan) in New York, Double-toothed Kite in FL/TX.
5. **Extinct species mapped as extant** — Passenger Pigeon resident in ~25
   states, Ivory-billed Woodpecker, Labrador Duck, Bachman's Warbler. Plus 8
   extinct Hawaiian species in `species` with no region rows at all (Hawaiian
   Crow, Poo-uli, Kauai Oo, Kamao, Ou, Olomao, Maui Akepa, Kauai Nukupuu).
6. **Physically impossible entries** — pelagic birds in landlocked states
   (Least Storm-Petrel in AZ/NM/NV, Wedge-tailed Shearwater in AZ), Pacific
   species on the Atlantic coast (Tufted Puffin in ME).
7. **Outdated/extirpated ranges** — Greater Prairie-Chicken in CT/MA/OH/MI,
   Bewick's Wren across 24 eastern states.

## Other findings

- `peak_frequency` is **NULL in 24,684 of 24,754 rows** — only ~70 Hawaii rows
  have values. The Explore tab orders species by frequency, so ordering is
  currently undefined for the mainland.
- The schema drifted from the PRD: actual columns are `state_code` /
  `peak_frequency` with a surrogate `id` PK, vs the PRD's `region_code` /
  `frequency` with a composite PK. Update PRD §12.4 or the schema.
- `species` holds **1,403 rows vs the planned ~900 curated NA species**, and
  includes exotics, extinct species, and non-NA species. The species list
  itself needs the same cleanup.
- **Security**: `public.species_aliases` has **RLS disabled** — fully readable
  and writable with the anon key. Fix (then add a read policy):
  `ALTER TABLE public.species_aliases ENABLE ROW LEVEL SECURITY;`

## Recommendation

Do not hand-patch 24,754 rows. The PRD already specifies the correct pipeline
(§13.2): hydrate `species_regions` from eBird state bar-chart bulk downloads —
that produces real per-week detection frequencies, correct season
classification (including `rare`), and fills `peak_frequency` for every row.
Concretely:

1. Cull `species` to the curated ~900 NA list (drop extinct, exotic-escape,
   and non-NA species; decide policy on established introductions like
   Hawaii's exotics).
2. Run the eBird bar-chart hydration script (Phase 2 / Stream C) and replace
   the current `species_regions` contents wholesale.
3. Keep this audit's `all-findings.json` as a regression spot-check list for
   the re-hydrated data (e.g., assert Atlantic Puffin ∉ OH, Cardinal =
   year_round, Nene = HI only).
