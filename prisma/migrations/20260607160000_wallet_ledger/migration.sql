-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_lab_id_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_lab_id_fkey";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "Payout";

-- CreateTable
CREATE TABLE "WalletEntry" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletEntry_lab_id_idx" ON "WalletEntry"("lab_id");

-- CreateIndex
CREATE INDEX "WalletEntry_ref_id_idx" ON "WalletEntry"("ref_id");

-- AddForeignKey
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

