import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'scorePhoto');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'scorePhoto');
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "photos" ADD COLUMN "geolocation_latitude" numeric;
  ALTER TABLE "photos" ADD COLUMN "geolocation_longitude" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_overall" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_technical" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_composition" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_subject_impact" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_uniqueness" numeric;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_ai_notes" varchar;
  ALTER TABLE "photos" ADD COLUMN "quality_scores_scored_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "site_title" varchar DEFAULT 'Photography' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "site_description" varchar DEFAULT 'A personal photography collection — scenes and details captured between projects.';
  ALTER TABLE "site_settings" ADD COLUMN "author_name" varchar DEFAULT 'Brandyn Britton' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "twitter_handle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "portfolio_link_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "portfolio_link_label" varchar DEFAULT 'Portfolio';
  ALTER TABLE "site_settings" ADD COLUMN "hero_headline" varchar DEFAULT 'Mostly birds';
  ALTER TABLE "site_settings" ADD COLUMN "hero_subtitle" varchar DEFAULT 'Sometimes landscapes. Occasionally something else entirely.';
  ALTER TABLE "site_settings" ADD COLUMN "about_title" varchar DEFAULT 'About This Collection';
  ALTER TABLE "site_settings" ADD COLUMN "about_left" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "about_right" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "birds_subtitle" varchar DEFAULT 'Every bird I''ve had the privilege of photographing.';
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "photos_date_taken_idx" ON "photos" USING btree ("date_taken");
  CREATE INDEX "photos_quality_scores_quality_scores_overall_idx" ON "photos" USING btree ("quality_scores_overall");
  ALTER TABLE "photos" DROP COLUMN "location";
  ALTER TABLE "site_settings" DROP COLUMN "title";
  ALTER TABLE "site_settings" DROP COLUMN "description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP INDEX "photos_date_taken_idx";
  DROP INDEX "photos_quality_scores_quality_scores_overall_idx";
  ALTER TABLE "photos" ADD COLUMN "location" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "title" varchar DEFAULT 'Photography | Brandyn Britton' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "description" varchar DEFAULT 'A personal photography collection by Brandyn Britton — scenes and details captured between projects.';
  ALTER TABLE "photos" DROP COLUMN "geolocation_latitude";
  ALTER TABLE "photos" DROP COLUMN "geolocation_longitude";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_overall";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_technical";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_composition";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_subject_impact";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_uniqueness";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_ai_notes";
  ALTER TABLE "photos" DROP COLUMN "quality_scores_scored_at";
  ALTER TABLE "site_settings" DROP COLUMN "site_title";
  ALTER TABLE "site_settings" DROP COLUMN "site_description";
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
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
