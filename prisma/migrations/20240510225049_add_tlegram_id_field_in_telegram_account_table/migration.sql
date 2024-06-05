/*
  Warnings:

  - Added the required column `telegram_user_id` to the `telegram_account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_account" ADD COLUMN     "telegram_user_id" TEXT NOT NULL;
