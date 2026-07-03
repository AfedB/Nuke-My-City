CREATE TABLE "zones" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"control" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"owner" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strikes" ADD COLUMN "faction" text;--> statement-breakpoint
ALTER TABLE "strikes" ADD COLUMN "zone_id" text;--> statement-breakpoint
CREATE INDEX "strikes_zone_idx" ON "strikes" USING btree ("zone_id");