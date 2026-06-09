-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_user_id_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "patient_name" TEXT,
ADD COLUMN     "patient_phone" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'PLATFORM',
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

