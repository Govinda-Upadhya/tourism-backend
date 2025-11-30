-- DropForeignKey
ALTER TABLE "public"."Bookings" DROP CONSTRAINT "Bookings_tourPackageId_fkey";

-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "eventId" TEXT,
ALTER COLUMN "tourPackageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "TourPackages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
