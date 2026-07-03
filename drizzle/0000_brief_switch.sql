CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pseudo" text NOT NULL,
	"email" text,
	"faction" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_pseudo_unique" UNIQUE("pseudo")
);
--> statement-breakpoint
CREATE TABLE "strikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"lng" double precision NOT NULL,
	"lat" double precision NOT NULL,
	"weapon" text NOT NULL,
	"seed" double precision,
	"city" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strikes_player_idx" ON "strikes" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "strikes_created_idx" ON "strikes" USING btree ("created_at");