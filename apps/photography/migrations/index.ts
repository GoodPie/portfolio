import * as migration_20260303_051400_add_slug_to_birds from './20260303_051400_add_slug_to_birds';

export const migrations = [
  {
    up: migration_20260303_051400_add_slug_to_birds.up,
    down: migration_20260303_051400_add_slug_to_birds.down,
    name: '20260303_051400_add_slug_to_birds'
  },
];
