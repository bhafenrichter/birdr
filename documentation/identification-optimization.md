# Bird Identification Optimization

Last updated: 2026-05-28

## Current State

**Overall pass rate: 67.2%** across 1,403 species at low detail.

| Rarity | Species | Pass Rate |
|---|---|---|
| Common | 544 | 86.4% |
| Uncommon | 375 | 61.6% |
| Rare | 348 | 51.4% |
| Epic | 69 | 56.5% |
| Legendary | 55 | 61.8% |

### What's been done
- **Species aliases** — 798 bidirectional alias pairs in `species_aliases` table. When GPT-4o returns a confusable species, all aliases are added as candidates and the picker is forced instead of auto-accepting.
- **Removed NA restriction** — GPT-4o prompt no longer limited to North American species. Zoo birds and exotic species can now be identified. `matchSpecies` filters to species in our DB.
- **Photo quality gating** — poor quality photos force the picker regardless of confidence.
- **Always low detail** — saves cost with ~1% accuracy difference vs high detail.

### Remaining failures
- **353 wrong species** (25.2%) — GPT-4o returns the wrong bird, usually a close relative
- **92 no candidates** (6.6%) — GPT-4o can't identify the species at all (exotic/extinct)
- **14 low confidence** (1.0%) — correct species but below 0.85 threshold

Of the 353 wrong species, 333 would cause UX collisions with common species if aliased (e.g., aliasing Sooty Shearwater would force the picker for 10 rare shearwaters every time someone photographs a common Sooty Shearwater). Only 27 were safe to alias without degrading UX.

## Recommended Next Steps

### 1. Replace Worst Illustrations
**Effort:** Low | **Impact:** +5-10%

Many failures are because the illustration itself is a poor reference — Wikipedia images shot from weird angles, low resolution, or showing non-distinctive plumage. Use the test results to identify the worst-performing illustrations and replace them with better reference photos. No code changes needed.

### 2. Implement State Code Resolution
**Effort:** Medium | **Impact:** +3-5%

The `resolveStateCode` function in `identify-bird/index.ts` is still a TODO returning `undefined`. Adding real lat/lon to state resolution would give GPT-4o location context and allow post-processing to filter candidates by range. Would help ~15-20 species that have non-overlapping ranges but look identical (e.g., Abert's Towhee is AZ/NV only, Canyon Towhee is wider).

### 3. Seasonal Filtering
**Effort:** Low | **Impact:** +2-3%

Cross-reference candidates against `species_regions.season` using the capture date and resolved state. Demote or remove out-of-season candidates (e.g., a "Summer Tanager" in December in Minnesota). Data already exists in the DB.

### 4. High Detail Retry for Aliased Species
**Effort:** Low | **Impact:** +3-5%

Currently always using low detail. When the first pass returns a candidate that has aliases, retry at high detail for better accuracy on just those confusable species. Only ~20% of captures would need the expensive second call.

### 5. Verification Prompt for Confusable Pairs
**Effort:** Medium | **Impact:** +5-8%

When a candidate has aliases, do a second GPT-4o call with a targeted prompt: "Is this bird A or B? Distinguishing features: A has [X], B has [Y]." We already have `distinguishing_feature` in the species table. More expensive (2 API calls) but much more accurate for the ~333 confusable pairs.

### 6. Multiple Photos
**Effort:** Medium | **Impact:** Medium

Allow users to submit 2-3 photos from different angles. Send all to GPT-4o in one call: "These are photos of the same bird from different angles." Would help with species where a single angle is ambiguous.

### 7. Crowd-Source Corrections
**Effort:** Medium | **Impact:** Long-term

Add a "Report Wrong ID" button on the card detail screen. When users correct an identification, log the pair and automatically add it as an alias after N reports. Self-improving system.

### 8. Fine-Tune on Failure Cases
**Effort:** High | **Impact:** High

Take the 353 failing illustrations, manually label them, and use them as fine-tuning data for a custom model. Expensive to set up but would directly address the long tail.

## Projected Impact

| After | Estimated Pass Rate (Common) | Estimated Pass Rate (Overall) |
|---|---|---|
| Current | 86.4% | 67.2% |
| + Better illustrations | ~91% | ~74% |
| + State code resolution | ~93% | ~77% |
| + Seasonal filtering | ~94% | ~79% |
| + High detail retry | ~95% | ~82% |

## Test Infrastructure

Test script: `scripts/test-identify-bird.js`

```bash
# Smoke test (5 species)
node scripts/test-identify-bird.js --limit 5

# Quarter run (355 species, ~$1)
node scripts/test-identify-bird.js --limit 355

# Full run (1421 species, ~$4)
node scripts/test-identify-bird.js --limit 1421

# Single species
node scripts/test-identify-bird.js --species "American Robin"

# With offset (resume)
node scripts/test-identify-bird.js --limit 500 --offset 1000
```

Results saved to `scripts/test-results/` with timestamps. Gitignored.

## Key Files
- `supabase/functions/identify-bird/index.ts` — main identification function with alias lookup, quality gating
- `supabase/functions/_shared/bird-id/gpt4o-adapter.ts` — GPT-4o prompt (no NA restriction, detail level)
- `supabase/functions/_shared/bird-id/types.ts` — provider interface with photo_quality, is_screen_photo, setting
- `scripts/test-identify-bird.js` — integration test script
- DB table: `species_aliases` — 798 bidirectional confusion pairs
