/*
  Warnings:

  - The `description` column on the `Events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `highlights` column on the `Events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `includes` column on the `Events` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "description",
ADD COLUMN     "description" TEXT[],
DROP COLUMN "highlights",
ADD COLUMN     "highlights" TEXT[],
DROP COLUMN "includes",
ADD COLUMN     "includes" TEXT[];
