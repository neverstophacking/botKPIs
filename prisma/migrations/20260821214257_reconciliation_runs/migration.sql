/*
  Warnings:

  - You are about to drop the `chat_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "chat_sessions";

-- CreateTable
CREATE TABLE "reconciliation_runs" (
    "id" SERIAL NOT NULL,
    "storeCode" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reconciliation_runs_storeCode_createdAt_idx" ON "reconciliation_runs"("storeCode", "createdAt");

-- CreateIndex
CREATE INDEX "reconciliation_runs_ok_createdAt_idx" ON "reconciliation_runs"("ok", "createdAt");
