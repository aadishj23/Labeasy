-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "lab_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "license_no" TEXT NOT NULL,
    "gst_no" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tests" (
    "id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_price" TEXT NOT NULL,
    "test_description" TEXT NOT NULL,

    CONSTRAINT "Tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "lab_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("lab_id","test_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_phone_key" ON "Lab"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_email_key" ON "Lab"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_license_no_key" ON "Lab"("license_no");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_gst_no_key" ON "Lab"("gst_no");

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
