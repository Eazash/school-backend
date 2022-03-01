-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_sectionId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sectionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
