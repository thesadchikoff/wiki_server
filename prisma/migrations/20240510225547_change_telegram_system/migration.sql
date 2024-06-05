/*
  Warnings:

  - You are about to drop the column `telegram_account_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `telegram_account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_telegram_account_id_fkey";

-- AlterTable
ALTER TABLE "telegram_account" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "telegram_account_id";

-- CreateIndex
CREATE UNIQUE INDEX "telegram_account_user_id_key" ON "telegram_account"("user_id");

-- AddForeignKey
ALTER TABLE "telegram_account" ADD CONSTRAINT "telegram_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
