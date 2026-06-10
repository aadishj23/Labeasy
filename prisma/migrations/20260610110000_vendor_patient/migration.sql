-- CreateTable
CREATE TABLE "VendorPatient" (
    "id" TEXT NOT NULL,
    "vendor_type" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "user_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPatient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorPatient_vendor_type_vendor_id_idx" ON "VendorPatient"("vendor_type", "vendor_id");

-- CreateIndex
CREATE INDEX "VendorPatient_user_id_idx" ON "VendorPatient"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPatient_vendor_type_vendor_id_phone_key" ON "VendorPatient"("vendor_type", "vendor_id", "phone");

-- AddForeignKey
ALTER TABLE "VendorPatient" ADD CONSTRAINT "VendorPatient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

