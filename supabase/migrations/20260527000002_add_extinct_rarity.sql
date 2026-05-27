-- Add 'extinct' value to rarity_tier enum
ALTER TYPE rarity_tier ADD VALUE IF NOT EXISTS 'extinct';

-- Mark extinct/impossible-to-spot species
UPDATE species SET rarity = 'extinct' WHERE scientific_name IN (
  'Campephilus principalis',   -- Ivory-billed Woodpecker
  'Vermivora bachmanii',       -- Bachman's Warbler
  'Numenius borealis',         -- Eskimo Curlew
  'Melamprosops phaeosoma',    -- Poo-uli
  'Myadestes myadestinus',     -- Kamao
  'Moho braccatus',            -- Kauai Oo
  'Hemignathus hanapepe',      -- Kauai Nukupuu
  'Psittirostra psittacea',    -- Ou
  'Myadestes lanaiensis',      -- Olomao
  'Loxops ochraceus',          -- Maui Akepa
  'Ectopistes migratorius',    -- Passenger Pigeon
  'Corvus hawaiiensis'         -- Hawaiian Crow (extinct in wild)
);
