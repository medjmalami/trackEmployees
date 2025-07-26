CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" text NOT NULL,
	"phone" varchar(100) NOT NULL,
	"daily_salary" integer NOT NULL,
	"attendance" json,
	"advances" json,
	"date_added" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"token" varchar(500) PRIMARY KEY NOT NULL
);
