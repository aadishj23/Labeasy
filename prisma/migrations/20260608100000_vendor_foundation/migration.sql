-- DropForeignKey
ALTER TABLE "InsuranceLead" DROP CONSTRAINT "InsuranceLead_partner_id_fkey";

-- DropIndex
DROP INDEX "Doctor_active_idx";

-- DropIndex
DROP INDEX "InsuranceLead_partner_id_idx";

-- DropIndex
DROP INDEX "InsuranceLead_sub_id_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "blurb",
DROP COLUMN "consult_url",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "license_url" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "InsuranceLead" DROP COLUMN "commission",
DROP COLUMN "partner_id",
DROP COLUMN "sub_id",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "plan_id" TEXT;

-- DropTable
DROP TABLE "InsurancePartner";

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "license_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "commission_pct" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_name_key" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_email_key" ON "InsuranceCompany"("email");

-- CreateIndex
CREATE INDEX "InsuranceCompany_status_idx" ON "InsuranceCompany"("status");

-- CreateIndex
CREATE INDEX "InsurancePlan_company_id_idx" ON "InsurancePlan"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE INDEX "Doctor_status_idx" ON "Doctor"("status");

-- CreateIndex
CREATE INDEX "InsuranceLead_company_id_idx" ON "InsuranceLead"("company_id");

-- AddForeignKey
ALTER TABLE "InsurancePlan" ADD CONSTRAINT "InsurancePlan_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceLead" ADD CONSTRAINT "InsuranceLead_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

