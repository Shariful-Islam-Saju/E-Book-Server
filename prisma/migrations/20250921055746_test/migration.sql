-- AlterEnum
ALTER TYPE "public"."UserType" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "public"."EBook" ADD COLUMN     "fileName" TEXT;
