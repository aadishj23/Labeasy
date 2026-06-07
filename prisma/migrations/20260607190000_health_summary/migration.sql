-- CreateTable
CREATE TABLE "HealthSummary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "suggested_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "input_hash" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthSummary_user_id_key" ON "HealthSummary"("user_id");

-- AddForeignKey
ALTER TABLE "HealthSummary" ADD CONSTRAINT "HealthSummary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

