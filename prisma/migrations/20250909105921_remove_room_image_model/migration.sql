/*
  Warnings:

  - You are about to drop the column `imageRoom` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `RoomImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RoomImage" DROP CONSTRAINT "RoomImage_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "imageRoom";

-- DropTable
DROP TABLE "public"."RoomImage";
