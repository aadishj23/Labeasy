-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "platform_discount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "scope" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "platform_discount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PolicyPurchase" ADD COLUMN     "platform_discount" INTEGER NOT NULL DEFAULT 0;

