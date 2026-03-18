-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."arm" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('senior', 'junior', 'master', 'amateur');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('men', 'women');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('upcoming', 'completed');--> statement-breakpoint
CREATE TYPE "public"."tournament_type" AS ENUM('national', 'international', 'em', 'wm');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slp_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season" varchar(20) NOT NULL,
	"member_id" uuid NOT NULL,
	"gender" "gender" NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"location" varchar(255),
	"type" "tournament_type" DEFAULT 'national' NOT NULL,
	"status" "tournament_status" DEFAULT 'upcoming' NOT NULL,
	"logo_url" text,
	"poster_url" text,
	"participant_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournament_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"gender" "gender" NOT NULL,
	"arm" "arm" NOT NULL,
	"type" "category_type" DEFAULT 'senior' NOT NULL,
	"weight_class" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournament_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"member_id" uuid,
	"athlete_name" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"position" integer NOT NULL,
	"base_points" integer DEFAULT 0,
	"bonus_points" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"gender" "gender" NOT NULL,
	"club_id" uuid,
	"country" varchar(100) DEFAULT 'Switzerland',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(50),
	"location" varchar(255),
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"president_id" uuid,
	CONSTRAINT "clubs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slp_rankings" ADD CONSTRAINT "slp_rankings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_categories" ADD CONSTRAINT "tournament_categories_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_category_id_tournament_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tournament_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/