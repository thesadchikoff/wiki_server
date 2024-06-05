/*
  Warnings:

  - Added the required column `telegram_account_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "telegramNotification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_account_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "telegram_account" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,

    CONSTRAINT "telegram_account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_account_id_fkey" FOREIGN KEY ("telegram_account_id") REFERENCES "telegram_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
