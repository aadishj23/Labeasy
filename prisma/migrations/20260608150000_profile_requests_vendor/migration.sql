-- Generalize ProfileChangeRequest: lab_id -> vendor_type/vendor_id (preserve as LAB)
ALTER TABLE "ProfileChangeRequest" DROP CONSTRAINT "ProfileChangeRequest_lab_id_fkey";
DROP INDEX "ProfileChangeRequest_lab_id_idx";
ALTER TABLE "ProfileChangeRequest" ADD COLUMN "vendor_type" TEXT NOT NULL DEFAULT 'LAB';
ALTER TABLE "ProfileChangeRequest" ADD COLUMN "vendor_id" TEXT;
UPDATE "ProfileChangeRequest" SET "vendor_id" = "lab_id";
ALTER TABLE "ProfileChangeRequest" ALTER COLUMN "vendor_id" SET NOT NULL;
ALTER TABLE "ProfileChangeRequest" ALTER COLUMN "vendor_type" DROP DEFAULT;
ALTER TABLE "ProfileChangeRequest" DROP COLUMN "lab_id";
CREATE INDEX "ProfileChangeRequest_vendor_type_vendor_id_idx" ON "ProfileChangeRequest"("vendor_type", "vendor_id");
CREATE INDEX "ProfileChangeRequest_status_idx" ON "ProfileChangeRequest"("status");
