-- DropIndex
DROP INDEX "SponsoredListing_test_id_idx";

-- AlterTable
ALTER TABLE "SponsoredListing" DROP COLUMN "test_id",
ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provider_order_id" TEXT,
ADD COLUMN     "provider_payment_id" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'DIRECTORY',
ADD COLUMN     "test_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "active" SET DEFAULT false;

