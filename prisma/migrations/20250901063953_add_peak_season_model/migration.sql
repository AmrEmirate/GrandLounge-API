-- CreateTable
CREATE TABLE "public"."peak_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "adjustmentValue" DOUBLE PRECISION NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peak_seasons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."peak_seasons" ADD CONSTRAINT "peak_seasons_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
