-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_fkey";

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
