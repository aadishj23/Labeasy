-- Doctor rating aggregate
ALTER TABLE "Doctor" ADD COLUMN     "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0;

-- Review: generalize lab_id -> target_type/target_id (preserve existing rows as LAB)
ALTER TABLE "Review" DROP CONSTRAINT "Review_lab_id_fkey";
DROP INDEX "Review_lab_id_idx";
DROP INDEX "Review_user_id_lab_id_key";
ALTER TABLE "Review" ADD COLUMN "target_type" TEXT NOT NULL DEFAULT 'LAB';
ALTER TABLE "Review" ADD COLUMN "target_id" TEXT;
UPDATE "Review" SET "target_id" = "lab_id";
ALTER TABLE "Review" ALTER COLUMN "target_id" SET NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "target_type" DROP DEFAULT;
ALTER TABLE "Review" DROP COLUMN "lab_id";
CREATE INDEX "Review_target_type_target_id_idx" ON "Review"("target_type", "target_id");
CREATE UNIQUE INDEX "Review_user_id_target_type_target_id_key" ON "Review"("user_id", "target_type", "target_id");
