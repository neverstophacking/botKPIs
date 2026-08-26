-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "centerId" INTEGER;

-- CreateTable
CREATE TABLE "Center" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationKey" TEXT,
    "locationId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Center_storeId_idx" ON "Center"("storeId");

-- CreateIndex
CREATE INDEX "Center_name_idx" ON "Center"("name");

-- CreateIndex
CREATE INDEX "Center_locationId_idx" ON "Center"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Center_storeId_code_key" ON "Center"("storeId", "code");

-- CreateIndex
CREATE INDEX "Order_centerId_dateCreated_idx" ON "Order"("centerId", "dateCreated");

-- AddForeignKey
ALTER TABLE "Center" ADD CONSTRAINT "Center_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE SET NULL ON UPDATE CASCADE;
