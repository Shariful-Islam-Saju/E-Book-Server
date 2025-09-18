/*
  Warnings:

  - You are about to drop the column `desscription` on the `EBook` table. All the data in the column will be lost.
  - You are about to drop the column `desscription` on the `Review` table. All the data in the column will be lost.
  - Added the required column `description` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ebookId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `mobile` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."EBook" DROP COLUMN "desscription",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "htmlCode" TEXT,
ADD COLUMN     "imgUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "ebookId" TEXT;

-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "desscription",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "ebookId" TEXT NOT NULL,
ALTER COLUMN "mobile" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "public"."EBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
