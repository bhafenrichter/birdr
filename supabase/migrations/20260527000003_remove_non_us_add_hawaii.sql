-- Remove species that are only available outside the US (no US/territory presence)
DELETE FROM species WHERE scientific_name IN (
  'Euodice cantans', 'Pionus menstruus', 'Pterocles exustus', 'Larosterna inca',
  'Aerodramus bartschi', 'Pterodroma alba', 'Cacatua moluccensis', 'Cacatua goffiniana',
  'Gygis candida', 'Anous ceruleus', 'Onychoprion lunatus', 'Puffinus nativitatis',
  'Pterodroma nigripennis', 'Pterodroma hypoleuca', 'Pterodroma heraldica',
  'Pterodroma cervicalis', 'Thalasseus bergii', 'Pterorhinus pectoralis'
);

-- Add US-HI region for Hawaiian endemic and introduced species
INSERT INTO species_regions (species_id, state_code, season, peak_frequency)
SELECT s.id, 'US-HI', 'year_round', 0.5
FROM species s
WHERE s.scientific_name IN (
  'Himatione sanguinea', 'Chlorodrepanis virens', 'Chasiempis sandwichensis',
  'Fulica alai', 'Buteo solitarius', 'Drepanis coccinea', 'Chlorodrepanis stejnegeri',
  'Chasiempis sclateri', 'Chlorodrepanis flava', 'Myadestes obscurus',
  'Telespiza cantans', 'Anas wyvilliana', 'Hemignathus wilsoni', 'Magumma parva',
  'Loxops coccineus', 'Loxops mana', 'Acrocephalus familiaris', 'Loxops caeruleirostris',
  'Oreomystis bairdi', 'Palmeria dolei', 'Anas laysanensis', 'Paroreomyza montana',
  'Pseudonestor xanthophrys', 'Telespiza ultima', 'Chasiempis ibidis',
  'Loxioides bailleui', 'Myadestes palmeri',
  'Garrulax canorus', 'Pternistis erckelii', 'Ortygornis pondicerianus',
  'Horornis diphone', 'Zosterops japonicus', 'Garrulax leucolophus'
)
AND NOT EXISTS (
  SELECT 1 FROM species_regions sr WHERE sr.species_id = s.id AND sr.state_code = 'US-HI'
);
