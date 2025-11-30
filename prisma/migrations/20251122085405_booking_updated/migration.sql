/*
  Warnings:

  - You are about to drop the column `status` on the `Bookings` table. All the data in the column will be lost.
  - You are about to drop the `CustomerDetails` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adress` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelers` to the `Bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle` to the `Bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Client" AS ENUM ('International', 'Local');

-- DropForeignKey
ALTER TABLE "public"."Bookings" DROP CONSTRAINT "Bookings_customerId_fkey";

-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "status",
ADD COLUMN     "adress" TEXT NOT NULL,
ADD COLUMN     "clientType" "Client" NOT NULL DEFAULT 'International',
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "travelers" INTEGER NOT NULL,
ADD COLUMN     "vehicle" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."CustomerDetails";
