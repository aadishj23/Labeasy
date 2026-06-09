-- Generalize Coupon: lab_id -> owner_type/owner_id (preserve as LAB)
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_lab_id_fkey";
DROP INDEX "Coupon_lab_id_idx";
DROP INDEX "Coupon_lab_id_code_key";
ALTER TABLE "Coupon" ADD COLUMN "owner_type" TEXT NOT NULL DEFAULT 'LAB';
ALTER TABLE "Coupon" ADD COLUMN "owner_id" TEXT;
UPDATE "Coupon" SET "owner_id" = "lab_id";
ALTER TABLE "Coupon" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "Coupon" ALTER COLUMN "owner_type" DROP DEFAULT;
ALTER TABLE "Coupon" DROP COLUMN "lab_id";
CREATE UNIQUE INDEX "Coupon_owner_type_owner_id_code_key" ON "Coupon"("owner_type", "owner_id", "code");
CREATE INDEX "Coupon_owner_type_owner_id_idx" ON "Coupon"("owner_type", "owner_id");

-- Generic redemption reference
ALTER TABLE "CouponRedemption" RENAME COLUMN "order_id" TO "ref_id";
