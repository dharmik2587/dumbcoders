CREATE TABLE "colleges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"domain" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"username" text,
	"profile_url" text,
	"bio" text,
	"avatar_url" text,
	"public_repos" integer DEFAULT 0 NOT NULL,
	"followers" integer DEFAULT 0 NOT NULL,
	"following" integer DEFAULT 0 NOT NULL,
	"languages" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"public_repository_count" integer DEFAULT 0 NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"full_name" text,
	"avatar_url" text,
	"username" text NOT NULL,
	"bio" text,
	"college_id" uuid,
	"branch" text,
	"graduation_year" integer,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"role_preference" text,
	"hackathon_interests" text[] DEFAULT '{}' NOT NULL,
	"availability" text,
	"portfolio_url" text,
	"linkedin_url" text,
	"onboarding_done" boolean DEFAULT false NOT NULL,
	"profile_complete" integer DEFAULT 0 NOT NULL,
	"is_open_to_team" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"payload" jsonb,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_data" ADD CONSTRAINT "github_data_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "colleges_domain_unique_idx" ON "colleges" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "github_data_user_unique_idx" ON "github_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "github_data_username_idx" ON "github_data" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_unique_idx" ON "profiles" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_unique_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_college_idx" ON "profiles" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "profiles_open_to_team_idx" ON "profiles" USING btree ("is_open_to_team");--> statement-breakpoint
CREATE INDEX "profiles_skills_gin_idx" ON "profiles" USING gin ("skills");--> statement-breakpoint
CREATE INDEX "webhook_events_provider_type_idx" ON "webhook_events" USING btree ("provider","event_type");--> statement-breakpoint
CREATE INDEX "webhook_events_status_idx" ON "webhook_events" USING btree ("status");