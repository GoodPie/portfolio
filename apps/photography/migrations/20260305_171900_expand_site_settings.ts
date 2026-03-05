import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" RENAME COLUMN "title" TO "site_title";
    ALTER TABLE "site_settings" RENAME COLUMN "description" TO "site_description";
    ALTER TABLE "site_settings" ADD COLUMN "author_name" varchar NOT NULL DEFAULT 'Brandyn Britton';
    ALTER TABLE "site_settings" ADD COLUMN "twitter_handle" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "portfolio_link_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "portfolio_link_label" varchar DEFAULT 'Portfolio';
    ALTER TABLE "site_settings" ADD COLUMN "hero_headline" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "hero_subtitle" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "about_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "about_left" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "about_right" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "birds_subtitle" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN "author_name";
    ALTER TABLE "site_settings" DROP COLUMN "twitter_handle";
    ALTER TABLE "site_settings" DROP COLUMN "portfolio_link_url";
    ALTER TABLE "site_settings" DROP COLUMN "portfolio_link_label";
    ALTER TABLE "site_settings" DROP COLUMN "hero_headline";
    ALTER TABLE "site_settings" DROP COLUMN "hero_subtitle";
    ALTER TABLE "site_settings" DROP COLUMN "about_title";
    ALTER TABLE "site_settings" DROP COLUMN "about_left";
    ALTER TABLE "site_settings" DROP COLUMN "about_right";
    ALTER TABLE "site_settings" DROP COLUMN "birds_subtitle";
    ALTER TABLE "site_settings" RENAME COLUMN "site_title" TO "title";
    ALTER TABLE "site_settings" RENAME COLUMN "site_description" TO "description";
  `)
}
