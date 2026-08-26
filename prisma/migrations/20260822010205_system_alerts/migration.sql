-- CreateTable
CREATE TABLE "system_alerts" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "storeCode" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_alerts_resolved_createdAt_idx" ON "system_alerts"("resolved", "createdAt");

-- CreateIndex
CREATE INDEX "system_alerts_type_createdAt_idx" ON "system_alerts"("type", "createdAt");
