/*
  Warnings:

  - Added the required column `name` to the `GeoZone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeoZone" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'PARKING';
