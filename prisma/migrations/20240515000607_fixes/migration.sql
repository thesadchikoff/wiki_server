-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_fkey";

-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
