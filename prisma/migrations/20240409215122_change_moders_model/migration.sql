/*
  Warnings:

  - You are about to drop the column `moderator_id` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_moderator_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "moderator_id";

-- CreateTable
CREATE TABLE "_moderated_content" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_moderated_content_AB_unique" ON "_moderated_content"("A", "B");

-- CreateIndex
CREATE INDEX "_moderated_content_B_index" ON "_moderated_content"("B");

-- AddForeignKey
ALTER TABLE "_moderated_content" ADD CONSTRAINT "_moderated_content_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_moderated_content" ADD CONSTRAINT "_moderated_content_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
