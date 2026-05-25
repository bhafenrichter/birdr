/**
 * 05-classify-species.js
 *
 * Rule-based classification of species into species_type, primary_habitat,
 * and season using taxonomic family/order. Covers ~95% of cases deterministically.
 *
 * Also generates size, about_text, and distinguishing_feature fields — these
 * are left null for manual/LLM curation later unless a curated override file exists.
 *
 * Input:  data/na-species-parsed.json
 * Output: data/species-curated.json
 *
 * Usage: node 05-classify-species.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const INPUT_FILE = `${DATA_DIR}na-species-parsed.json`;
const OUTPUT_FILE = `${DATA_DIR}species-curated.json`;

// ─── Family → species_type mapping ───────────────────────────────────────────
// Keys are family names as they appear in the Clements taxonomy CSV
const FAMILY_TO_TYPE = {
  // Waterfowl
  "Anatidae (Ducks, Geese, and Waterfowl)": "Waterfowl",
  "Anseranatidae (Magpie Goose)": "Waterfowl",

  // Birds of prey
  "Accipitridae (Hawks, Eagles, and Kites)": "Birds of prey",
  "Pandionidae (Osprey)": "Birds of prey",
  "Falconidae (Falcons and Caracaras)": "Birds of prey",
  "Cathartidae (New World Vultures)": "Birds of prey",
  "Strigidae (Owls)": "Birds of prey",
  "Tytonidae (Barn-Owls)": "Birds of prey",

  // Wading birds
  "Ardeidae (Herons, Egrets, and Bitterns)": "Wading birds",
  "Threskiornithidae (Ibises and Spoonbills)": "Wading birds",
  "Ciconiidae (Storks)": "Wading birds",
  "Gruidae (Cranes)": "Wading birds",
  "Rallidae (Rails, Gallinules, and Coots)": "Wading birds",
  "Aramidae (Limpkin)": "Wading birds",
  "Phoenicopteridae (Flamingos)": "Wading birds",
  "Heliornithidae (Finfoots)": "Wading birds",
  "Jacanidae (Jacanas)": "Wading birds",

  // Shorebirds
  "Scolopacidae (Sandpipers and Allies)": "Shorebirds",
  "Charadriidae (Plovers and Lapwings)": "Shorebirds",
  "Recurvirostridae (Stilts and Avocets)": "Shorebirds",
  "Haematopodidae (Oystercatchers)": "Shorebirds",
  "Burhinidae (Thick-knees)": "Shorebirds",
  "Glareolidae (Pratincoles and Coursers)": "Shorebirds",

  // Seabirds
  "Laridae (Gulls, Terns, and Skimmers)": "Seabirds",
  "Procellariidae (Shearwaters and Petrels)": "Seabirds",
  "Hydrobatidae (Northern Storm-Petrels)": "Seabirds",
  "Oceanitidae (Southern Storm-Petrels)": "Seabirds",
  "Diomedeidae (Albatrosses)": "Seabirds",
  "Alcidae (Auks, Murres, and Puffins)": "Seabirds",
  "Sulidae (Boobies and Gannets)": "Seabirds",
  "Pelecanidae (Pelicans)": "Seabirds",
  "Phalacrocoracidae (Cormorants and Shags)": "Seabirds",
  "Fregatidae (Frigatebirds)": "Seabirds",
  "Phaethontidae (Tropicbirds)": "Seabirds",
  "Stercorariidae (Skuas and Jaegers)": "Seabirds",
  "Anhingidae (Anhingas)": "Seabirds",
  "Gaviidae (Loons)": "Seabirds",

  // Game birds
  "Phasianidae (Pheasants, Grouse, and Allies)": "Game birds",
  "Odontophoridae (New World Quail)": "Game birds",
  "Cracidae (Guans, Chachalacas, and Curassows)": "Game birds",
  "Numididae (Guineafowl)": "Game birds",
  "Columbidae (Pigeons and Doves)": "Game birds",
  "Pteroclidae (Sandgrouse)": "Game birds",

  // Woodpeckers
  "Picidae (Woodpeckers)": "Woodpeckers",
  "Ramphastidae (Toucans)": "Woodpeckers",

  // Aerial specialists
  "Trochilidae (Hummingbirds)": "Aerial specialists",
  "Apodidae (Swifts)": "Aerial specialists",
  "Caprimulgidae (Nightjars and Allies)": "Aerial specialists",
  "Hirundinidae (Swallows)": "Aerial specialists",

  // Songbirds — all remaining Passeriformes families
  "Fringillidae (Finches, Euphonias, and Allies)": "Songbirds",
  "Parulidae (New World Warblers)": "Songbirds",
  "Tyrannidae (Tyrant Flycatchers)": "Songbirds",
  "Passerellidae (New World Sparrows)": "Songbirds",
  "Corvidae (Crows, Jays, and Magpies)": "Songbirds",
  "Estrildidae (Waxbills and Allies)": "Songbirds",
  "Turdidae (Thrushes and Allies)": "Songbirds",
  "Icteridae (Troupials and Allies)": "Songbirds",
  "Muscicapidae (Old World Flycatchers)": "Songbirds",
  "Cardinalidae (Cardinals and Allies)": "Songbirds",
  "Vireonidae (Vireos, Shrike-Babblers, and Erpornis)": "Songbirds",
  "Mimidae (Mockingbirds and Thrashers)": "Songbirds",
  "Paridae (Tits, Chickadees, and Titmice)": "Songbirds",
  "Thraupidae (Tanagers and Allies)": "Songbirds",
  "Ploceidae (Weavers and Allies)": "Songbirds",
  "Calcariidae (Longspurs and Snow Buntings)": "Songbirds",
  "Emberizidae (Old World Buntings)": "Songbirds",
  "Motacillidae (Wagtails and Pipits)": "Songbirds",
  "Troglodytidae (Wrens)": "Songbirds",
  "Laniidae (Shrikes)": "Songbirds",
  "Acrocephalidae (Reed Warblers and Allies)": "Songbirds",
  "Phylloscopidae (Leaf Warblers)": "Songbirds",
  "Sturnidae (Starlings)": "Songbirds",
  "Polioptilidae (Gnatcatchers)": "Songbirds",
  "Sittidae (Nuthatches)": "Songbirds",
  "Viduidae (Whydahs and Indigobirds)": "Songbirds",
  "Locustellidae (Grassbirds and Allies)": "Songbirds",
  "Leiothrichidae (Laughingthrushes and Allies)": "Songbirds",
  "Alaudidae (Larks)": "Songbirds",
  "Paradoxornithidae (Parrotbills)": "Songbirds",
  "Regulidae (Kinglets)": "Songbirds",
  "Bombycillidae (Waxwings)": "Songbirds",
  "Ptiliogonatidae (Silky-flycatchers)": "Songbirds",
  "Tityridae (Tityras and Allies)": "Songbirds",
  "Monarchidae (Monarch Flycatchers)": "Songbirds",
  "Pycnonotidae (Bulbuls)": "Songbirds",
  "Zosteropidae (White-eyes, Yuhinas, and Allies)": "Songbirds",
  "Passeridae (Old World Sparrows)": "Songbirds",
  "Remizidae (Penduline-Tits)": "Songbirds",
  "Cettiidae (Bush Warblers and Allies)": "Songbirds",
  "Aegithalidae (Long-tailed Tits)": "Songbirds",
  "Sylviidae (Sylviid Warblers and Allies)": "Songbirds",
  "Certhiidae (Treecreepers)": "Songbirds",
  "Cinclidae (Dippers)": "Songbirds",
  "Mohoidae (Hawaiian Honeyeaters)": "Songbirds",
  "Chloropseidae (Leafbirds)": "Songbirds",
  "Peucedramidae (Olive Warbler)": "Songbirds",
  "Prunellidae (Accentors)": "Songbirds",
  "Phaenicophilidae (Greater Antillean Tanagers)": "Songbirds",
  "Icteriidae (Yellow-breasted Chat)": "Songbirds",
  "Thamnophilidae (Typical Antbirds)": "Songbirds",

  // Oddball non-passerines → closest fit
  "Psittacidae (New World and African Parrots)": "Aerial specialists",
  "Psittaculidae (Old World Parrots)": "Aerial specialists",
  "Cacatuidae (Cockatoos)": "Aerial specialists",
  "Cuculidae (Cuckoos)": "Songbirds",
  "Podicipedidae (Grebes)": "Waterfowl",
  "Alcedinidae (Kingfishers)": "Aerial specialists",
  "Trogonidae (Trogons)": "Aerial specialists",
  "Coraciidae (Rollers)": "Aerial specialists",
  "Bucerotidae (Hornbills)": "Aerial specialists",
  "Upupidae (Hoopoes)": "Aerial specialists",
  "Musophagidae (Turacos)": "Aerial specialists",
  "Struthionidae (Ostriches)": "Game birds",
  "Casuariidae (Cassowaries and Emu)": "Game birds",
  "Rheidae (Rheas)": "Game birds",
  "Tinamidae (Tinamous)": "Game birds",
};

// ─── Family → primary_habitat mapping ────────────────────────────────────────
const FAMILY_TO_HABITAT = {
  // Forests
  "Picidae (Woodpeckers)": "Forests",
  "Ramphastidae (Toucans)": "Forests",
  "Trogonidae (Trogons)": "Forests",
  "Corvidae (Crows, Jays, and Magpies)": "Forests",
  "Paridae (Tits, Chickadees, and Titmice)": "Forests",
  "Sittidae (Nuthatches)": "Forests",
  "Certhiidae (Treecreepers)": "Forests",
  "Vireonidae (Vireos, Shrike-Babblers, and Erpornis)": "Forests",
  "Parulidae (New World Warblers)": "Forests",
  "Turdidae (Thrushes and Allies)": "Forests",
  "Regulidae (Kinglets)": "Forests",
  "Aegithalidae (Long-tailed Tits)": "Forests",
  "Monarchidae (Monarch Flycatchers)": "Forests",
  "Cracidae (Guans, Chachalacas, and Curassows)": "Forests",
  "Strigidae (Owls)": "Forests",
  "Tytonidae (Barn-Owls)": "Forests",
  "Accipitridae (Hawks, Eagles, and Kites)": "Forests",
  "Cuculidae (Cuckoos)": "Forests",
  "Bucerotidae (Hornbills)": "Forests",
  "Tityridae (Tityras and Allies)": "Forests",
  "Leiothrichidae (Laughingthrushes and Allies)": "Forests",
  "Mohoidae (Hawaiian Honeyeaters)": "Forests",
  "Chloropseidae (Leafbirds)": "Forests",
  "Thamnophilidae (Typical Antbirds)": "Forests",
  "Musophagidae (Turacos)": "Forests",
  "Coraciidae (Rollers)": "Forests",
  "Bombycillidae (Waxwings)": "Forests",
  "Peucedramidae (Olive Warbler)": "Forests",
  "Paradoxornithidae (Parrotbills)": "Forests",

  // Wetlands
  "Ardeidae (Herons, Egrets, and Bitterns)": "Wetlands",
  "Rallidae (Rails, Gallinules, and Coots)": "Wetlands",
  "Threskiornithidae (Ibises and Spoonbills)": "Wetlands",
  "Aramidae (Limpkin)": "Wetlands",
  "Jacanidae (Jacanas)": "Wetlands",
  "Heliornithidae (Finfoots)": "Wetlands",
  "Phoenicopteridae (Flamingos)": "Wetlands",
  "Anhingidae (Anhingas)": "Wetlands",

  // Freshwater
  "Anatidae (Ducks, Geese, and Waterfowl)": "Freshwater",
  "Anseranatidae (Magpie Goose)": "Freshwater",
  "Podicipedidae (Grebes)": "Freshwater",
  "Gaviidae (Loons)": "Freshwater",
  "Cinclidae (Dippers)": "Freshwater",
  "Alcedinidae (Kingfishers)": "Freshwater",

  // Coasts & ocean
  "Laridae (Gulls, Terns, and Skimmers)": "Coasts & ocean",
  "Procellariidae (Shearwaters and Petrels)": "Coasts & ocean",
  "Hydrobatidae (Northern Storm-Petrels)": "Coasts & ocean",
  "Oceanitidae (Southern Storm-Petrels)": "Coasts & ocean",
  "Diomedeidae (Albatrosses)": "Coasts & ocean",
  "Alcidae (Auks, Murres, and Puffins)": "Coasts & ocean",
  "Sulidae (Boobies and Gannets)": "Coasts & ocean",
  "Pelecanidae (Pelicans)": "Coasts & ocean",
  "Phalacrocoracidae (Cormorants and Shags)": "Coasts & ocean",
  "Fregatidae (Frigatebirds)": "Coasts & ocean",
  "Phaethontidae (Tropicbirds)": "Coasts & ocean",
  "Stercorariidae (Skuas and Jaegers)": "Coasts & ocean",
  "Scolopacidae (Sandpipers and Allies)": "Coasts & ocean",
  "Charadriidae (Plovers and Lapwings)": "Coasts & ocean",
  "Haematopodidae (Oystercatchers)": "Coasts & ocean",
  "Recurvirostridae (Stilts and Avocets)": "Wetlands",
  "Burhinidae (Thick-knees)": "Coasts & ocean",
  "Glareolidae (Pratincoles and Coursers)": "Grasslands & farmland",

  // Grasslands & farmland
  "Passerellidae (New World Sparrows)": "Grasslands & farmland",
  "Icteridae (Troupials and Allies)": "Grasslands & farmland",
  "Calcariidae (Longspurs and Snow Buntings)": "Grasslands & farmland",
  "Alaudidae (Larks)": "Grasslands & farmland",
  "Phasianidae (Pheasants, Grouse, and Allies)": "Grasslands & farmland",
  "Odontophoridae (New World Quail)": "Grasslands & farmland",
  "Ciconiidae (Storks)": "Grasslands & farmland",
  "Gruidae (Cranes)": "Grasslands & farmland",
  "Falconidae (Falcons and Caracaras)": "Grasslands & farmland",
  "Cathartidae (New World Vultures)": "Grasslands & farmland",
  "Laniidae (Shrikes)": "Grasslands & farmland",
  "Motacillidae (Wagtails and Pipits)": "Grasslands & farmland",
  "Locustellidae (Grassbirds and Allies)": "Grasslands & farmland",
  "Pteroclidae (Sandgrouse)": "Grasslands & farmland",
  "Numididae (Guineafowl)": "Grasslands & farmland",
  "Struthionidae (Ostriches)": "Grasslands & farmland",
  "Rheidae (Rheas)": "Grasslands & farmland",
  "Casuariidae (Cassowaries and Emu)": "Grasslands & farmland",
  "Tinamidae (Tinamous)": "Grasslands & farmland",

  // Cities & towns
  "Columbidae (Pigeons and Doves)": "Cities & towns",
  "Sturnidae (Starlings)": "Cities & towns",
  "Passeridae (Old World Sparrows)": "Cities & towns",
  "Estrildidae (Waxbills and Allies)": "Cities & towns",
  "Ploceidae (Weavers and Allies)": "Cities & towns",
  "Pycnonotidae (Bulbuls)": "Cities & towns",
  "Zosteropidae (White-eyes, Yuhinas, and Allies)": "Cities & towns",
  "Viduidae (Whydahs and Indigobirds)": "Cities & towns",
  "Psittacidae (New World and African Parrots)": "Cities & towns",
  "Psittaculidae (Old World Parrots)": "Cities & towns",
  "Cacatuidae (Cockatoos)": "Cities & towns",
  "Fringillidae (Finches, Euphonias, and Allies)": "Cities & towns",
  "Cardinalidae (Cardinals and Allies)": "Forests",
  "Mimidae (Mockingbirds and Thrashers)": "Cities & towns",

  // Mountains
  "Pandionidae (Osprey)": "Mountains",
  "Ptiliogonatidae (Silky-flycatchers)": "Deserts & scrublands",
  "Prunellidae (Accentors)": "Tundra",

  // Deserts & scrublands
  "Polioptilidae (Gnatcatchers)": "Deserts & scrublands",
  "Remizidae (Penduline-Tits)": "Deserts & scrublands",
  "Upupidae (Hoopoes)": "Deserts & scrublands",

  // Misc
  "Trochilidae (Hummingbirds)": "Forests",
  "Apodidae (Swifts)": "Cities & towns",
  "Caprimulgidae (Nightjars and Allies)": "Forests",
  "Hirundinidae (Swallows)": "Cities & towns",
  "Tyrannidae (Tyrant Flycatchers)": "Forests",
  "Muscicapidae (Old World Flycatchers)": "Forests",
  "Troglodytidae (Wrens)": "Forests",
  "Acrocephalidae (Reed Warblers and Allies)": "Wetlands",
  "Phylloscopidae (Leaf Warblers)": "Forests",
  "Emberizidae (Old World Buntings)": "Grasslands & farmland",
  "Thraupidae (Tanagers and Allies)": "Forests",
  "Sylviidae (Sylviid Warblers and Allies)": "Forests",
  "Phaenicophilidae (Greater Antillean Tanagers)": "Forests",
  "Icteriidae (Yellow-breasted Chat)": "Forests",
  "Cettiidae (Bush Warblers and Allies)": "Forests",
};

// ─── Order-based fallback for season ─────────────────────────────────────────
// Most Passeriformes in NA are migratory/summer; residents are the exception.
// We use family-level overrides for known residents.
const RESIDENT_FAMILIES = new Set([
  "Corvidae (Crows, Jays, and Magpies)",
  "Paridae (Tits, Chickadees, and Titmice)",
  "Sittidae (Nuthatches)",
  "Picidae (Woodpeckers)",
  "Strigidae (Owls)",
  "Tytonidae (Barn-Owls)",
  "Phasianidae (Pheasants, Grouse, and Allies)",
  "Odontophoridae (New World Quail)",
  "Columbidae (Pigeons and Doves)",
  "Mimidae (Mockingbirds and Thrashers)",
  "Polioptilidae (Gnatcatchers)",
  "Troglodytidae (Wrens)",
  "Aegithalidae (Long-tailed Tits)",
  "Certhiidae (Treecreepers)",
  "Regulidae (Kinglets)",
  "Cathartidae (New World Vultures)",
  "Psittacidae (New World and African Parrots)",
  "Psittaculidae (Old World Parrots)",
  "Cacatuidae (Cockatoos)",
  "Sturnidae (Starlings)",
  "Passeridae (Old World Sparrows)",
  "Estrildidae (Waxbills and Allies)",
  "Ploceidae (Weavers and Allies)",
  "Pycnonotidae (Bulbuls)",
  "Remizidae (Penduline-Tits)",
  "Leiothrichidae (Laughingthrushes and Allies)",
  "Zosteropidae (White-eyes, Yuhinas, and Allies)",
  "Viduidae (Whydahs and Indigobirds)",
  "Paradoxornithidae (Parrotbills)",
  "Cracidae (Guans, Chachalacas, and Curassows)",
  "Numididae (Guineafowl)",
  "Struthionidae (Ostriches)",
  "Casuariidae (Cassowaries and Emu)",
  "Rheidae (Rheas)",
  "Alcedinidae (Kingfishers)",
  "Rallidae (Rails, Gallinules, and Coots)",
  "Aramidae (Limpkin)",
  "Phalacrocoracidae (Cormorants and Shags)",
  "Monarchidae (Monarch Flycatchers)",
]);

// Families that are primarily migratory (pass through, don't breed or winter broadly in NA)
const MIGRATORY_FAMILIES = new Set([
  "Scolopacidae (Sandpipers and Allies)",
  "Charadriidae (Plovers and Lapwings)",
  "Phylloscopidae (Leaf Warblers)",
  "Muscicapidae (Old World Flycatchers)",
  "Motacillidae (Wagtails and Pipits)",
  "Emberizidae (Old World Buntings)",
  "Acrocephalidae (Reed Warblers and Allies)",
  "Locustellidae (Grassbirds and Allies)",
  "Prunellidae (Accentors)",
  "Sylviidae (Sylviid Warblers and Allies)",
]);

// Families that are primarily winter visitors
const WINTER_FAMILIES = new Set([
  "Calcariidae (Longspurs and Snow Buntings)",
]);

// Pelagic families — season depends on hemisphere/species, default year_round
const PELAGIC_FAMILIES = new Set([
  "Procellariidae (Shearwaters and Petrels)",
  "Hydrobatidae (Northern Storm-Petrels)",
  "Oceanitidae (Southern Storm-Petrels)",
  "Diomedeidae (Albatrosses)",
  "Stercorariidae (Skuas and Jaegers)",
  "Phaethontidae (Tropicbirds)",
  "Fregatidae (Frigatebirds)",
]);

function classifySeason(family, order) {
  if (RESIDENT_FAMILIES.has(family)) return "year_round";
  if (WINTER_FAMILIES.has(family)) return "winter";
  if (MIGRATORY_FAMILIES.has(family)) return "migratory";
  if (PELAGIC_FAMILIES.has(family)) return "year_round";

  // Most warblers, vireos, flycatchers, tanagers, hummingbirds, swallows are summer breeders
  const summerFamilies = [
    "Parulidae", "Vireonidae", "Tyrannidae", "Cardinalidae",
    "Trochilidae", "Hirundinidae", "Caprimulgidae", "Apodidae",
    "Thraupidae", "Tityridae", "Icteridae",
  ];
  if (summerFamilies.some((f) => family.startsWith(f))) return "summer";

  // Waterfowl, gulls, grebes, loons — many are year-round or mixed
  const yearRoundFamilies = [
    "Anatidae", "Laridae", "Podicipedidae", "Gaviidae",
    "Pelecanidae", "Sulidae", "Alcidae", "Anhingidae",
    "Ardeidae", "Threskiornithidae", "Phoenicopteridae",
    "Gruidae", "Ciconiidae", "Accipitridae", "Falconidae",
    "Pandionidae", "Fringillidae", "Passerellidae", "Turdidae",
  ];
  if (yearRoundFamilies.some((f) => family.startsWith(f))) return "year_round";

  // Default
  return "year_round";
}

// Slug mappings
const TYPE_SLUGS = {
  "Songbirds": "songbirds",
  "Birds of prey": "birds-of-prey",
  "Waterfowl": "waterfowl",
  "Wading birds": "wading-birds",
  "Shorebirds": "shorebirds",
  "Seabirds": "seabirds",
  "Game birds": "game-birds",
  "Woodpeckers": "woodpeckers",
  "Aerial specialists": "aerial-specialists",
};

const HABITAT_SLUGS = {
  "Forests": "forests",
  "Grasslands & farmland": "grasslands-farmland",
  "Deserts & scrublands": "deserts-scrublands",
  "Wetlands": "wetlands",
  "Freshwater": "freshwater",
  "Coasts & ocean": "coasts-ocean",
  "Mountains": "mountains",
  "Tundra": "tundra",
  "Cities & towns": "cities-towns",
};

function main() {
  if (!existsSync(INPUT_FILE)) {
    console.error(`Error: ${INPUT_FILE} not found.`);
    console.error("Run step 04 (parse-species) first.");
    process.exit(1);
  }

  const species = JSON.parse(readFileSync(INPUT_FILE, "utf-8"));
  console.log(`Classifying ${species.length} species...\n`);

  const unmappedTypes = new Set();
  const unmappedHabitats = new Set();
  const typeCounts = {};
  const habitatCounts = {};
  const seasonCounts = {};

  const curated = species.map((sp) => {
    const speciesType = FAMILY_TO_TYPE[sp.family] || null;
    const habitat = FAMILY_TO_HABITAT[sp.family] || null;
    const season = classifySeason(sp.family, sp.taxonomic_order);

    if (!speciesType) unmappedTypes.add(sp.family);
    if (!habitat) unmappedHabitats.add(sp.family);

    const finalType = speciesType || "Songbirds";
    const finalHabitat = habitat || "Forests";

    typeCounts[finalType] = (typeCounts[finalType] || 0) + 1;
    habitatCounts[finalHabitat] = (habitatCounts[finalHabitat] || 0) + 1;
    seasonCounts[season] = (seasonCounts[season] || 0) + 1;

    return {
      common_name: sp.common_name,
      scientific_name: sp.scientific_name,
      family: sp.family,
      taxonomic_order: sp.taxonomic_order,
      conservation_status: sp.conservation_status || "LC",
      species_type: finalType,
      species_type_slug: TYPE_SLUGS[finalType],
      primary_habitat: finalHabitat,
      primary_habitat_slug: HABITAT_SLUGS[finalHabitat],
      season,
      size: null,
      about_text: null,
      distinguishing_feature: null,
    };
  });

  writeFileSync(OUTPUT_FILE, JSON.stringify(curated, null, 2));

  // Report
  console.log("Species type distribution:");
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }

  console.log("\nHabitat distribution:");
  for (const [hab, count] of Object.entries(habitatCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${hab}: ${count}`);
  }

  console.log("\nSeason distribution:");
  for (const [season, count] of Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${season}: ${count}`);
  }

  if (unmappedTypes.size > 0) {
    console.log(`\nUnmapped families (type, defaulted to Songbirds):`);
    for (const f of unmappedTypes) console.log(`  - ${f}`);
  }
  if (unmappedHabitats.size > 0) {
    console.log(`\nUnmapped families (habitat, defaulted to Forests):`);
    for (const f of unmappedHabitats) console.log(`  - ${f}`);
  }

  console.log(`\nSaved ${curated.length} curated species to ${OUTPUT_FILE}`);
  console.log("Fields size, about_text, distinguishing_feature are null — curate in next step.");
}

main();
