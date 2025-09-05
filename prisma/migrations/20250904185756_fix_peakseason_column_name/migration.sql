/*
  Warnings:

  - You are about to drop the column `priceAdjustment` on the `PeakSeason` table. All the data in the column will be lost.
  - Added the required column `adjustmentValue` to the `PeakSeason` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PeakSeason" DROP COLUMN "priceAdjustment",
ADD COLUMN     "adjustmentValue" DOUBLE PRECISION NOT NULL;
