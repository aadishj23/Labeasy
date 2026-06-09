-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "amount_paid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paid_status" TEXT;

