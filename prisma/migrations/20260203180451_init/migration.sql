CREATE EXTENSION IF NOT EXISTS postgis;
-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BikeTypeNames" AS ENUM ('CITY', 'ROAD', 'MOUNTAIN');

-- CreateEnum
CREATE TYPE "BikeStatuses" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "GeoZoneTypes" AS ENUM ('PARKING', 'FORBIDDEN', 'SPEED_LIMIT');

-- CreateTable
CREATE TABLE "BikeType" (
    "id" SERIAL NOT NULL,
    "name" "BikeTypeNames" NOT NULL,
    "requiresEnergy" BOOLEAN NOT NULL DEFAULT false,
    "priceFactor" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "BikeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bike" (
    "id" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "batteryCharge" INTEGER NOT NULL DEFAULT 100,
    "location" geometry(Point, 4326),
    "status" "BikeStatuses" NOT NULL,

    CONSTRAINT "Bike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRoles" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoZone" (
    "id" SERIAL NOT NULL,
    "type" "GeoZoneTypes" NOT NULL,
    "area" geometry(Polygon, 4326) NOT NULL,
    "speedLimit" DECIMAL(65,30),

    CONSTRAINT "GeoZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalPrice" DECIMAL(65,30),

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BikeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
