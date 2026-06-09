-- AlterTable
ALTER TABLE "InsurancePlan" ADD COLUMN     "commission_approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PolicyPurchase" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLACED',
    "provider_order_id" TEXT,
    "provider_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PolicyPurchase_company_id_idx" ON "PolicyPurchase"("company_id");

-- CreateIndex
CREATE INDEX "PolicyPurchase_user_id_idx" ON "PolicyPurchase"("user_id");

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_status_idx" ON "ProfileChangeRequest"("status");

-- AddForeignKey
ALTER TABLE "PolicyPurchase" ADD CONSTRAINT "PolicyPurchase_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyPurchase" ADD CONSTRAINT "PolicyPurchase_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyPurchase" ADD CONSTRAINT "PolicyPurchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

