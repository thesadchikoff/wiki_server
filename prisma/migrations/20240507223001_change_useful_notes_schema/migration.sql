/*
  Warnings:

  - You are about to drop the column `useful_notes_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the `UsefulNotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsefulNotes" DROP CONSTRAINT "UsefulNotes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_useful_notes_id_fkey";

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "useful_notes_id";

-- DropTable
DROP TABLE "UsefulNotes";

-- CreateTable
CREATE TABLE "_usefull_content" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_usefull_content_AB_unique" ON "_usefull_content"("A", "B");

-- CreateIndex
CREATE INDEX "_usefull_content_B_index" ON "_usefull_content"("B");

-- AddForeignKey
ALTER TABLE "_usefull_content" ADD CONSTRAINT "_usefull_content_A_fkey" FOREIGN KEY ("A") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usefull_content" ADD CONSTRAINT "_usefull_content_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
