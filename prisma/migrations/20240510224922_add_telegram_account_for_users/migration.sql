-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_telegram_account_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "telegram_account_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_account_id_fkey" FOREIGN KEY ("telegram_account_id") REFERENCES "telegram_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
