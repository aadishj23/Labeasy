-- CreateTable
CREATE TABLE "SponsoredListing" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "test_id" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsoredListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsoredListing_lab_id_idx" ON "SponsoredListing"("lab_id");

-- CreateIndex
CREATE INDEX "SponsoredListing_test_id_idx" ON "SponsoredListing"("test_id");

-- AddForeignKey
ALTER TABLE "SponsoredListing" ADD CONSTRAINT "SponsoredListing_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

