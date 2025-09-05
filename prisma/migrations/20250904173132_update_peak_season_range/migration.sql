/*
  Warnings:

  - You are about to drop the column `date` on the `PeakSeason` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `PeakSeason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PeakSeason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `PeakSeason` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."PeakSeason_roomId_date_key";

-- AlterTable
ALTER TABLE "public"."PeakSeason" DROP COLUMN "date",
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startDate" DATE NOT NULL;
