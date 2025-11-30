/*
  Warnings:

  - You are about to drop the column `customerId` on the `Bookings` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "customerId",
DROP COLUMN "password";
