-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Report_share_token_key" ON "Report"("share_token");

