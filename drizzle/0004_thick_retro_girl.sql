CREATE TABLE "leetcode_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"total_solved" integer DEFAULT 0 NOT NULL,
	"easy_solved" integer DEFAULT 0 NOT NULL,
	"medium_solved" integer DEFAULT 0 NOT NULL,
	"hard_solved" integer DEFAULT 0 NOT NULL,
	"ranking" integer,
	"contest_rating" integer,
	"contests_attended" integer DEFAULT 0 NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "github_username" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "leetcode_username" text;--> statement-breakpoint
ALTER TABLE "leetcode_data" ADD CONSTRAINT "leetcode_data_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "leetcode_data_user_unique_idx" ON "leetcode_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leetcode_data_username_idx" ON "leetcode_data" USING btree ("username");