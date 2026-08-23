CREATE TABLE "hackathon_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"source" text NOT NULL,
	"source_id" text NOT NULL,
	"source_url" text,
	"registration_url" text,
	"payload_hash" text,
	"raw_payload" jsonb,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"organizer" text,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"registration_deadline_at" timestamp with time zone,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"mode" text,
	"location" text,
	"team_size_min" integer,
	"team_size_max" integer,
	"prize_amount" numeric(14, 2),
	"prize_currency" text DEFAULT 'INR' NOT NULL,
	"prize_display" text,
	"themes" text[] DEFAULT '{}' NOT NULL,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"registration_url" text,
	"source_url" text,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_run_id" text,
	"source" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"total_received" integer DEFAULT 0 NOT NULL,
	"created_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"rejected_count" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"href" text,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text DEFAULT 'direct' NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"team_id" uuid,
	"hackathon_id" uuid,
	"message" text,
	"role_offered" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"hackathon_id" uuid,
	"leader_id" text NOT NULL,
	"max_members" integer DEFAULT 4 NOT NULL,
	"roles_needed" text[] DEFAULT '{}' NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'forming' NOT NULL,
	"result_note" text,
	"project_name" text,
	"project_url" text,
	"demo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathon_bookmarks" ADD CONSTRAINT "hackathon_bookmarks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_bookmarks" ADD CONSTRAINT "hackathon_bookmarks_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_interests" ADD CONSTRAINT "hackathon_interests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_interests" ADD CONSTRAINT "hackathon_interests_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_sources" ADD CONSTRAINT "hackathon_sources_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_from_user_id_profiles_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_to_user_id_profiles_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_profiles_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_bookmarks_user_hackathon_unique_idx" ON "hackathon_bookmarks" USING btree ("user_id","hackathon_id");--> statement-breakpoint
CREATE INDEX "hackathon_bookmarks_user_idx" ON "hackathon_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_interests_user_hackathon_unique_idx" ON "hackathon_interests" USING btree ("user_id","hackathon_id");--> statement-breakpoint
CREATE INDEX "hackathon_interests_user_idx" ON "hackathon_interests" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_sources_source_id_unique_idx" ON "hackathon_sources" USING btree ("source","source_id");--> statement-breakpoint
CREATE INDEX "hackathon_sources_hackathon_idx" ON "hackathon_sources" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "hackathon_sources_source_idx" ON "hackathon_sources" USING btree ("source");--> statement-breakpoint
CREATE UNIQUE INDEX "hackathons_canonical_key_unique_idx" ON "hackathons" USING btree ("canonical_key");--> statement-breakpoint
CREATE INDEX "hackathons_deadline_idx" ON "hackathons" USING btree ("registration_deadline_at");--> statement-breakpoint
CREATE INDEX "hackathons_status_deadline_idx" ON "hackathons" USING btree ("status","registration_deadline_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ingestion_runs_external_run_unique_idx" ON "ingestion_runs" USING btree ("external_run_id");--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_status_idx" ON "ingestion_runs" USING btree ("source","status");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_dedupe_unique_idx" ON "notifications" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "outbox_events_status_available_idx" ON "outbox_events" USING btree ("status","available_at");--> statement-breakpoint
CREATE INDEX "outbox_events_aggregate_idx" ON "outbox_events" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_team_user_unique_idx" ON "team_members" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "team_members_team_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_members_user_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_requests_from_user_idx" ON "team_requests" USING btree ("from_user_id","status");--> statement-breakpoint
CREATE INDEX "team_requests_to_user_idx" ON "team_requests" USING btree ("to_user_id","status");--> statement-breakpoint
CREATE INDEX "team_requests_team_idx" ON "team_requests" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "teams_leader_idx" ON "teams" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "teams_hackathon_idx" ON "teams" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "teams_open_status_idx" ON "teams" USING btree ("is_open","status");