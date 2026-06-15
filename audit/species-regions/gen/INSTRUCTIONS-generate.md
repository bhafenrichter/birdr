# Generation instructions — species_regions regeneration

You are an expert North American ornithologist generating the CORRECT contents of a
`species_regions` table for the birdr app (state-level bird distribution for the 50 US
states). The existing table data is known to be badly wrong — you are generating
replacement data **from scratch, from your own knowledge of real bird distribution**.
Do NOT read the existing `species_regions` rows; they would anchor you on garbage.

## Step 1 — fetch your species slice

Load the Supabase SQL tool via ToolSearch with query "select:mcp__supabase__execute_sql".
Then run (project_id "enctbzysromgremkqykc", substituting YOUR offset):

```sql
select common_name, scientific_name from species
order by common_name, id
limit 50 offset <YOUR_OFFSET>;
```

## Step 2 — for each species, generate its true distribution

For each species decide first whether it belongs in the app's wild-bird dataset at all:

- Set `"remove": true` (with a short `remove_reason`) and an empty `regions` array if the
  species is: extinct or extinct-in-the-wild; a cage-bird/zoo escape with NO established,
  countable wild US population; or a species that does not regularly occur in the US at all.
- Introduced species WITH established wild populations (e.g., European Starling, House
  Sparrow, Chukar in the Great Basin, Hawaii's established exotics, Florida's established
  parrots like Monk Parakeet) are KEPT, with regions limited to where they are actually
  established.
- Otherwise `"remove": false` and list regions.

For kept species, list EVERY state (50 US states only, no DC/territories) where the species
**regularly occurs** — i.e., a birder visiting the right habitat in the right season has a
realistic chance of finding it, and it is recorded annually. Pure vagrant states are
excluded. Be complete: missing states are just as wrong as extra states.

Per state, assign exactly one season:
- `year_round` — regularly present in all seasons in that state
- `summer` — breeding/summer season only (Neotropical migrants in their breeding states, etc.)
- `winter` — winter only
- `migratory` — spring/fall passage only
- `rare` — occurs annually but in very small numbers (regular rarity, NOT a vagrant);
  use sparingly for edge-of-range states

Season is judged PER STATE: a species can be summer in MN, migratory in TX, winter in LA.
Get the big ones right: sedentary residents (chickadees, cardinals, wrens, woodpeckers,
quail) are `year_round` throughout; long-distance migrants that winter south of the US are
NEVER `year_round` anywhere; Arctic breeders are `winter`/`migratory` in the lower 48;
pelagic species occur ONLY in ocean-coast states; eastern and western sister species
(Black-capped vs Carolina Chickadee, Winter vs Pacific Wren, Baltimore vs Bullock's Oriole)
must not bleed across the divide.

Per state, estimate `freq` — peak detection frequency: the fraction of complete eBird
checklists in that state, during the species' peak season, that record the species.
Calibration anchors:
- 0.40–0.75 — ubiquitous backyard/common birds at their core (Northern Cardinal in NC ≈ 0.6,
  American Robin in OH ≈ 0.6)
- 0.20–0.40 — common and widespread in the state
- 0.08–0.20 — fairly common; expected in right habitat
- 0.02–0.08 — uncommon or habitat-restricted
- 0.005–0.02 — scarce, local, or hard to detect
- 0.001–0.005 — regular rarity (pairs naturally with season `rare`)
Frequencies must be > 0 and < 1, and should DIFFER between core-range and edge states.

## Step 3 — write your output file

Write JSON to /Users/brandonhafenrichter/Projects/birdr/audit/species-regions/gen/batch-NN.json
(NN = your zero-padded batch number):

```json
{
  "batch": NN,
  "offset": <YOUR_OFFSET>,
  "species": [
    {
      "common_name": "Northern Cardinal",
      "scientific_name": "Cardinalis cardinalis",
      "remove": false,
      "regions": [
        {"state": "AL", "season": "year_round", "freq": 0.62},
        {"state": "AZ", "season": "year_round", "freq": 0.08}
      ]
    },
    {
      "common_name": "Passenger Pigeon",
      "scientific_name": "Ectopistes migratorius",
      "remove": true,
      "remove_reason": "extinct 1914",
      "regions": []
    }
  ]
}
```

Rules: `scientific_name` and `common_name` must be echoed EXACTLY as returned by the SQL
query (they are the join keys). `state` is the bare 2-letter USPS code. Every species from
your query must appear exactly once. Valid JSON only — no comments, no trailing commas.

## Step 4 — final message

Return only: batch number, species count, how many marked remove, total region rows
generated. Do not return the JSON itself.
