-- birdr seed data: species_types and habitats lookup tables

-- =============================================================================
-- SPECIES TYPES (9 rows per PRD §7.2)
-- =============================================================================

insert into species_types (name, slug, description) values
  ('Songbirds',           'songbirds',           'Sparrows, warblers, finches, thrushes, jays, blackbirds, wrens'),
  ('Birds of prey',       'birds-of-prey',       'Hawks, eagles, falcons, owls'),
  ('Waterfowl',           'waterfowl',           'Ducks, geese, swans, loons, grebes'),
  ('Wading birds',        'wading-birds',        'Herons, egrets, ibis, cranes, rails, bitterns'),
  ('Shorebirds',          'shorebirds',          'Plovers, sandpipers, oystercatchers, avocets'),
  ('Seabirds',            'seabirds',            'Gulls, terns, albatrosses, shearwaters, puffins'),
  ('Game birds',          'game-birds',          'Quail, grouse, turkeys, pheasants, ptarmigan'),
  ('Woodpeckers',         'woodpeckers',         'Woodpeckers, sapsuckers, flickers'),
  ('Aerial specialists',  'aerial-specialists',  'Hummingbirds, swifts, swallows, nightjars')
on conflict (name) do nothing;

-- =============================================================================
-- HABITATS (9 rows per PRD §7.2)
-- =============================================================================

insert into habitats (name, slug, description) values
  ('Forests',              'forests',              'Wood thrush, scarlet tanager, pileated woodpecker, ovenbird, boreal chickadee'),
  ('Grasslands & farmland','grasslands-farmland',  'Bobolink, grasshopper sparrow, lark bunting, eastern meadowlark, barn owl'),
  ('Deserts & scrublands', 'deserts-scrublands',   'Sage grouse, cactus wren, Gambel''s quail, roadrunner, elf owl'),
  ('Wetlands',             'wetlands',             'Marsh wren, American bittern, sora, prothonotary warbler, wood duck'),
  ('Freshwater',           'freshwater',           'Common loon, hooded merganser, pied-billed grebe, American dipper'),
  ('Coasts & ocean',       'coasts-ocean',         'Piping plover, American oystercatcher, clapper rail, seaside sparrow'),
  ('Mountains',            'mountains',            'Peregrine falcon, canyon wren, white-throated swift, golden eagle'),
  ('Tundra',               'tundra',               'Snowy owl, rock ptarmigan, Lapland longspur, snow bunting'),
  ('Cities & towns',       'cities-towns',         'Northern cardinal, American robin, mourning dove, house finch, rock pigeon')
on conflict (name) do nothing;
