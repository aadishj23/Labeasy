-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_lab_id_idx" ON "Payout"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_lab_id_period_key" ON "Payout"("lab_id", "period");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

