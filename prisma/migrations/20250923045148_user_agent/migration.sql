-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT;
