/*
  Warnings:

  - Made the column `grade` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `section` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "image" TEXT,
ALTER COLUMN "grade" SET NOT NULL,
ALTER COLUMN "section" SET NOT NULL;
