/*
  Warnings:

  - A unique constraint covering the columns `[reservationId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "reservationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reservationId_key" ON "public"."Booking"("reservationId");
