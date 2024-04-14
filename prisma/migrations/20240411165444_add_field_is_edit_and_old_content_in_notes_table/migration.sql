-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "old_content" TEXT;
