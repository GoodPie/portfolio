import * as migration_20260303_051400_add_slug_to_birds from './20260303_051400_add_slug_to_birds';
import * as migration_20260303_060410_add_taxonomy_and_ebird_fields from './20260303_060410_add_taxonomy_and_ebird_fields';

export const migrations = [
  {
    up: migration_20260303_051400_add_slug_to_birds.up,
    down: migration_20260303_051400_add_slug_to_birds.down,
    name: '20260303_051400_add_slug_to_birds',
  },
  {
    up: migration_20260303_060410_add_taxonomy_and_ebird_fields.up,
    down: migration_20260303_060410_add_taxonomy_and_ebird_fields.down,
    name: '20260303_060410_add_taxonomy_and_ebird_fields'
  },
];
