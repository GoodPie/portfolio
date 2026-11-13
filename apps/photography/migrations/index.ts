import * as migration_20260303_051400_add_slug_to_birds from './20260303_051400_add_slug_to_birds';
import * as migration_20260303_060410_add_taxonomy_and_ebird_fields from './20260303_060410_add_taxonomy_and_ebird_fields';
import * as migration_20260305_142320 from './20260305_142320';
import * as migration_20260305_171900_expand_site_settings from './20260305_171900_expand_site_settings';
import * as migration_20261113_074537_payload_3_93 from './20261113_074537_payload_3_93';

export const migrations = [
  {
    up: migration_20260303_051400_add_slug_to_birds.up,
    down: migration_20260303_051400_add_slug_to_birds.down,
    name: '20260303_051400_add_slug_to_birds',
  },
  {
    up: migration_20260303_060410_add_taxonomy_and_ebird_fields.up,
    down: migration_20260303_060410_add_taxonomy_and_ebird_fields.down,
    name: '20260303_060410_add_taxonomy_and_ebird_fields',
  },
  {
    up: migration_20260305_142320.up,
    down: migration_20260305_142320.down,
    name: '20260305_142320',
  },
  {
    up: migration_20260305_171900_expand_site_settings.up,
    down: migration_20260305_171900_expand_site_settings.down,
    name: '20260305_171900_expand_site_settings'
  },
  {
    up: migration_20261113_074537_payload_3_93.up,
    down: migration_20261113_074537_payload_3_93.down,
    name: '20261113_074537_payload_3_93'
  },
];
