/*
  Warnings:

  - The `carousel` column on the `TourPackages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TourPackages" DROP COLUMN "carousel",
ADD COLUMN     "carousel" TEXT[];
