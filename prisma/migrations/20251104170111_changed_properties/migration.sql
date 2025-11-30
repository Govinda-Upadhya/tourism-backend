/*
  Warnings:

  - You are about to drop the column `includes` on the `TourPackages` table. All the data in the column will be lost.
  - The `description` column on the `TourPackages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `highlights` column on the `TourPackages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TourPackages" DROP COLUMN "includes",
ADD COLUMN     "included" TEXT[],
DROP COLUMN "description",
ADD COLUMN     "description" TEXT[],
DROP COLUMN "highlights",
ADD COLUMN     "highlights" TEXT[];
