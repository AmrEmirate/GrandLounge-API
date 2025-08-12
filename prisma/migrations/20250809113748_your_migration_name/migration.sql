-- AlterTable
ALTER TABLE "public"."RoomAvailability" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "Property_tenantId_idx" ON "public"."Property"("tenantId");

-- CreateIndex
CREATE INDEX "Property_categoryId_idx" ON "public"."Property"("categoryId");

-- CreateIndex
CREATE INDEX "Review_accountId_idx" ON "public"."Review"("accountId");

-- CreateIndex
CREATE INDEX "Review_propertyId_idx" ON "public"."Review"("propertyId");

-- CreateIndex
CREATE INDEX "Room_propertyId_idx" ON "public"."Room"("propertyId");

-- CreateIndex
CREATE INDEX "Transaction_accountId_idx" ON "public"."Transaction"("accountId");

-- CreateIndex
CREATE INDEX "Transaction_roomId_idx" ON "public"."Transaction"("roomId");
