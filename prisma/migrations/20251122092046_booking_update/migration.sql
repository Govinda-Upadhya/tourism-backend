/*
  Warnings:

  - The values [International,Local] on the enum `Client` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Client_new" AS ENUM ('INTERNATIONAL', 'LOCAL');
ALTER TABLE "public"."Bookings" ALTER COLUMN "clientType" DROP DEFAULT;
ALTER TABLE "Bookings" ALTER COLUMN "clientType" TYPE "Client_new" USING ("clientType"::text::"Client_new");
ALTER TYPE "Client" RENAME TO "Client_old";
ALTER TYPE "Client_new" RENAME TO "Client";
DROP TYPE "public"."Client_old";
ALTER TABLE "Bookings" ALTER COLUMN "clientType" SET DEFAULT 'INTERNATIONAL';
COMMIT;

-- AlterTable
ALTER TABLE "Bookings" ALTER COLUMN "clientType" SET DEFAULT 'INTERNATIONAL';
