CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"street" text NOT NULL,
	"zip" text NOT NULL,
	"city" text NOT NULL,
	"size_sqm" numeric(8, 2) NOT NULL,
	"rent_eur" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
