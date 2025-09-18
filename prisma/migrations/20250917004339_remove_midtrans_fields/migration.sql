/*
  Warnings:

  - You are about to drop the column `paymentToken` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `paymentUrl` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "paymentToken",
DROP COLUMN "paymentUrl";
