-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_lab_id_fkey";

-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_test_id_fkey";

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
