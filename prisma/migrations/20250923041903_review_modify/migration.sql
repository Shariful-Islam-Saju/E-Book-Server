/*
  Warnings:

  - Added the required column `FacebookImg` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImg` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "FacebookImg" TEXT NOT NULL,
ADD COLUMN     "profileImg" TEXT NOT NULL;
