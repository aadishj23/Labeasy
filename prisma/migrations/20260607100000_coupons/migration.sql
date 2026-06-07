-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FLAT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "coupon_id" TEXT;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL DEFAULT 'PERCENT',
    "value" INTEGER NOT NULL,
    "max_discount" INTEGER,
    "min_order" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "per_user_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coupon_lab_id_idx" ON "Coupon"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_lab_id_code_key" ON "Coupon"("lab_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_order_id_key" ON "CouponRedemption"("order_id");

-- CreateIndex
CREATE INDEX "CouponRedemption_coupon_id_idx" ON "CouponRedemption"("coupon_id");

-- CreateIndex
CREATE INDEX "CouponRedemption_user_id_idx" ON "CouponRedemption"("user_id");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

