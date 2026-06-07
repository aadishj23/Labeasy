-- AlterTable
ALTER TABLE "User" ADD COLUMN     "insurance_discount_pct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "insured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "InsurancePartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "blurb" TEXT,
    "plan_highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "referral_url" TEXT NOT NULL,
    "test_discount_pct" INTEGER NOT NULL DEFAULT 0,
    "commission_note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsurancePartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceLead" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "user_id" TEXT,
    "sub_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLICKED',
    "commission" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted_at" TIMESTAMP(3),

    CONSTRAINT "InsuranceLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePartner_slug_key" ON "InsurancePartner"("slug");

-- CreateIndex
CREATE INDEX "InsurancePartner_active_idx" ON "InsurancePartner"("active");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceLead_sub_id_key" ON "InsuranceLead"("sub_id");

-- CreateIndex
CREATE INDEX "InsuranceLead_partner_id_idx" ON "InsuranceLead"("partner_id");

-- CreateIndex
CREATE INDEX "InsuranceLead_user_id_idx" ON "InsuranceLead"("user_id");

-- AddForeignKey
ALTER TABLE "InsuranceLead" ADD CONSTRAINT "InsuranceLead_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "InsurancePartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceLead" ADD CONSTRAINT "InsuranceLead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

