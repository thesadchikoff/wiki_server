-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
