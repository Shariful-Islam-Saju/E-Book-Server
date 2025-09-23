/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `EBook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `EBook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."EBook" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EBook_slug_key" ON "public"."EBook"("slug");

-- CreateIndex
CREATE INDEX "EBook_slug_idx" ON "public"."EBook"("slug");
