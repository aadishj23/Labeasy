-- CreateTable
CREATE TABLE "UserTest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "test_price" TEXT NOT NULL,

    CONSTRAINT "UserTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTest_user_id_test_id_lab_id_key" ON "UserTest"("user_id", "test_id", "lab_id");

-- AddForeignKey
ALTER TABLE "UserTest" ADD CONSTRAINT "UserTest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTest" ADD CONSTRAINT "UserTest_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTest" ADD CONSTRAINT "UserTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
