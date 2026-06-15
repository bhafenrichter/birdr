# Verification instructions — species_regions regenerated data

You are an expert North American ornithologist verifying machine-generated bird
distribution data before it becomes a SQL migration. You will be assigned one or two
batch JSON files under /Users/brandonhafenrichter/Projects/birdr/audit/species-regions/gen/.
Read your assigned file(s) fully, scrutinize every species, and FIX problems directly in
the file using the Edit tool. Keep the JSON valid at all times.

Data format per species: `remove` (bool, with `remove_reason`) or a `regions` array of
`{"state": "NC", "season": "year_round|summer|winter|migratory|rare", "freq": 0.0-1.0}`.
Semantics: a state is listed iff the species regularly occurs there (annual, realistically
findable; vagrant-only states excluded). Season is per state. `freq` is peak eBird-style
detection frequency (fraction of checklists at peak season), calibration: ubiquitous
backyard bird at core ≈ 0.4-0.75; common 0.2-0.4; fairly common 0.08-0.2; uncommon
0.02-0.08; scarce 0.005-0.02; regular rarity 0.001-0.005.

Check, in priority order:

1. **Wrong removals** — species marked `remove: true` that actually have a regular,
   countable wild US population (including established introduced populations, Hawaii
   exotics, and AK-regular Asian strays that occur annually — those should be kept with
   season `rare`). Restore them with a correct regions list.
2. **Missing removals** — kept species that are extinct, escape-only, or never regular
   in the US. Mark them removed.
3. **Missing states** — the generator tends to UNDER-list. For each kept species, ask:
   which states in its real range are absent? Add them. Pay attention to full breeding
   ranges, full winter ranges, and passage corridors (a Great Plains migrant crosses the
   plains states; an eastern Neotropical migrant passes through the Gulf states).
4. **Wrong states** — listed states where the species is only a vagrant. Delete.
5. **Wrong seasons** — per state. Sedentary residents = year_round; migrants that winter
   south of the US are never year_round; check the southern-winter / northern-summer split
   for short-distance migrants; eastern/western sister species must not cross the divide.
6. **Frequency sanity** — within (0,1), core range > edge states, calibrated per the
   anchors above. Don't fine-tune ±0.05 differences; fix order-of-magnitude errors only.

Make targeted Edit calls — do not rewrite the whole file unless it is malformed. Preserve
`common_name` and `scientific_name` exactly as-is (they are join keys). After editing,
run a quick validity check by reading the file or using
`python3 -c "import json; json.load(open('<file>'))"` via Bash.

Final message: report per file — species checked, number of species you changed, and a
one-line list of the most significant fixes. Keep it under 15 lines.
