-- WalletEntry: generalize lab_id -> owner_type/owner_id (preserve existing LAB rows)
ALTER TABLE "WalletEntry" DROP CONSTRAINT "WalletEntry_lab_id_fkey";
DROP INDEX "WalletEntry_lab_id_idx";
ALTER TABLE "WalletEntry" ADD COLUMN "owner_type" TEXT NOT NULL DEFAULT 'LAB';
ALTER TABLE "WalletEntry" ADD COLUMN "owner_id" TEXT;
UPDATE "WalletEntry" SET "owner_id" = "lab_id";
ALTER TABLE "WalletEntry" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "WalletEntry" ALTER COLUMN "owner_type" DROP DEFAULT;
ALTER TABLE "WalletEntry" DROP COLUMN "lab_id";
CREATE INDEX "WalletEntry_owner_type_owner_id_idx" ON "WalletEntry"("owner_type", "owner_id");

-- CreateTable
CREATE TABLE "DoctorSlot" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "fee" INTEGER NOT NULL,
    "platform_fee" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLACED',
    "provider_order_id" TEXT,
    "provider_payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorSlot_doctor_id_idx" ON "DoctorSlot"("doctor_id");

-- CreateIndex
CREATE INDEX "Appointment_doctor_id_idx" ON "Appointment"("doctor_id");

-- CreateIndex
CREATE INDEX "Appointment_user_id_idx" ON "Appointment"("user_id");

-- AddForeignKey
ALTER TABLE "DoctorSlot" ADD CONSTRAINT "DoctorSlot_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "DoctorSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
