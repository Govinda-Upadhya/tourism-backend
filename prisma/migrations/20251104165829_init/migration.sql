-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'PENDING', 'CONFIRMED', 'CANCELLED', 'UPCOMING', 'ONGOING', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Sedan', 'SUV', 'Bus', 'Van', 'Luxury');

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourPackages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "carousel" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "locations" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "includes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPackages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourPackageVehicle" (
    "id" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "status" "Status",

    CONSTRAINT "TourPackageVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'UPCOMING',
    "date" TEXT NOT NULL,
    "maxpeople" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "includes" TEXT NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "payment_status" "Status" NOT NULL,
    "customerId" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDetails" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "requests" TEXT,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "number_of_people" INTEGER NOT NULL,
    "diet" TEXT NOT NULL,

    CONSTRAINT "CustomerDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TourPackageVehicle" ADD CONSTRAINT "TourPackageVehicle_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "TourPackages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourPackageVehicle" ADD CONSTRAINT "TourPackageVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "TourPackages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
