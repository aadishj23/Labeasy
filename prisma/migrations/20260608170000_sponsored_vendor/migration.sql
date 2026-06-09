-- Generalize SponsoredListing: lab_id -> owner_type/owner_id (preserve as LAB)
ALTER TABLE "SponsoredListing" DROP CONSTRAINT "SponsoredListing_lab_id_fkey";
DROP INDEX "SponsoredListing_lab_id_idx";
ALTER TABLE "SponsoredListing" ADD COLUMN "owner_type" TEXT NOT NULL DEFAULT 'LAB';
ALTER TABLE "SponsoredListing" ADD COLUMN "owner_id" TEXT;
UPDATE "SponsoredListing" SET "owner_id" = "lab_id";
ALTER TABLE "SponsoredListing" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "SponsoredListing" ALTER COLUMN "owner_type" DROP DEFAULT;
ALTER TABLE "SponsoredListing" DROP COLUMN "lab_id";
CREATE INDEX "SponsoredListing_owner_type_owner_id_idx" ON "SponsoredListing"("owner_type", "owner_id");
