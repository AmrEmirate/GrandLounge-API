/*
  Warnings:

  - You are about to drop the `peak_seasons` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AdjustmentType" AS ENUM ('NOMINAL', 'PERCENTAGE');

-- DropForeignKey
ALTER TABLE "public"."peak_seasons" DROP CONSTRAINT "peak_seasons_roomId_fkey";

-- DropTable
DROP TABLE "public"."peak_seasons";

-- CreateTable
CREATE TABLE "public"."PeakSeason" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL,
    "adjustmentType" "public"."AdjustmentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeakSeason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeakSeason_roomId_date_key" ON "public"."PeakSeason"("roomId", "date");

-- AddForeignKey
ALTER TABLE "public"."PeakSeason" ADD CONSTRAINT "PeakSeason_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
