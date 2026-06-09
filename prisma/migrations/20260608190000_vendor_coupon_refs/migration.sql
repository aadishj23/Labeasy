-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "coupon_id" TEXT;

-- AlterTable
ALTER TABLE "PolicyPurchase" ADD COLUMN     "coupon_id" TEXT;

-- RenameIndex
ALTER INDEX "CouponRedemption_order_id_key" RENAME TO "CouponRedemption_ref_id_key";

