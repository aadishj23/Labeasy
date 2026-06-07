-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "gmv" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_lab_id_idx" ON "Invoice"("lab_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_lab_id_period_key" ON "Invoice"("lab_id", "period");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

