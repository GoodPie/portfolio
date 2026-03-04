import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "birds" ADD COLUMN "taxonomic_order" varchar;
  ALTER TABLE "birds" ADD COLUMN "family" varchar;
  ALTER TABLE "birds" ADD COLUMN "ebird_species_code" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "birds" DROP COLUMN "taxonomic_order";
  ALTER TABLE "birds" DROP COLUMN "family";
  ALTER TABLE "birds" DROP COLUMN "ebird_species_code";`)
}
