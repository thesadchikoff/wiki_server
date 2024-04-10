/*
  Warnings:

  - Added the required column `angle` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "angle" INTEGER NOT NULL;
