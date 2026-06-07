-- AlterTable: add pincode (backfill existing rows, then enforce NOT NULL)
ALTER TABLE "Doctor" ADD COLUMN "pincode" TEXT;
UPDATE "Doctor" SET "pincode" = '000000' WHERE "pincode" IS NULL;
ALTER TABLE "Doctor" ALTER COLUMN "pincode" SET NOT NULL;
