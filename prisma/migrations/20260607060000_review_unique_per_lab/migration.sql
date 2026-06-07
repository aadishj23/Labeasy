-- Deduplicate: keep only the most recent review per (user_id, lab_id) for real
-- users (seeded reviews have NULL user_id and are left untouched).
DELETE FROM "Review" a
USING "Review" b
WHERE a.user_id IS NOT NULL
  AND a.user_id = b.user_id
  AND a.lab_id = b.lab_id
  AND (a.created_at < b.created_at OR (a.created_at = b.created_at AND a.id < b.id));

-- DropIndex
DROP INDEX "Review_user_id_lab_id_order_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_lab_id_key" ON "Review"("user_id", "lab_id");
