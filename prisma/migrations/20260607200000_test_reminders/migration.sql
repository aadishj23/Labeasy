-- CreateTable
CREATE TABLE "TestReminder" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "interval_days" INTEGER NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestReminder_user_id_idx" ON "TestReminder"("user_id");

-- CreateIndex
CREATE INDEX "TestReminder_due_at_idx" ON "TestReminder"("due_at");

-- AddForeignKey
ALTER TABLE "TestReminder" ADD CONSTRAINT "TestReminder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

