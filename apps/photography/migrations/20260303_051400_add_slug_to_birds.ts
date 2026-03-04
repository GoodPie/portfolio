import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add slug column to birds table
  await db.execute(sql`
    ALTER TABLE "birds" ADD COLUMN IF NOT EXISTS "slug" varchar;
  `)

  // Backfill slugs from existing names
  await db.execute(sql`
    UPDATE "birds"
    SET "slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE "slug" IS NULL;
  `)

  // Strip leading/trailing hyphens from generated slugs
  await db.execute(sql`
    UPDATE "birds"
    SET "slug" = TRIM(BOTH '-' FROM "slug")
    WHERE "slug" LIKE '-%' OR "slug" LIKE '%-';
  `)

  // Make slug NOT NULL after backfill
  await db.execute(sql`
    ALTER TABLE "birds" ALTER COLUMN "slug" SET NOT NULL;
  `)

  // Add unique index
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "birds_slug_idx" ON "birds" USING btree ("slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "birds_slug_idx";
    ALTER TABLE "birds" DROP COLUMN IF EXISTS "slug";
  `)
}
