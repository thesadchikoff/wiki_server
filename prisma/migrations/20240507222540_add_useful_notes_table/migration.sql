-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "useful_notes_id" TEXT;

-- CreateTable
CREATE TABLE "UsefulNotes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UsefulNotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsefulNotes" ADD CONSTRAINT "UsefulNotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_useful_notes_id_fkey" FOREIGN KEY ("useful_notes_id") REFERENCES "UsefulNotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
