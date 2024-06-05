-- DropForeignKey
ALTER TABLE "ModerActionLog" DROP CONSTRAINT "ModerActionLog_moderator_id_fkey";

-- AlterTable
ALTER TABLE "ModerActionLog" ALTER COLUMN "moderator_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ModerActionLog" ADD CONSTRAINT "ModerActionLog_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
