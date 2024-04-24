-- DropForeignKey
ALTER TABLE "ModerActionLog" DROP CONSTRAINT "ModerActionLog_moderator_id_fkey";

-- AddForeignKey
ALTER TABLE "ModerActionLog" ADD CONSTRAINT "ModerActionLog_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
