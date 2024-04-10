-- CreateEnum
CREATE TYPE "ModerActionType" AS ENUM ('ACCEPT', 'UNACCEPT');

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "is_accept" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ModerActionLog" (
    "id" TEXT NOT NULL,
    "type" "ModerActionType" NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerActionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModerActionLog" ADD CONSTRAINT "ModerActionLog_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
