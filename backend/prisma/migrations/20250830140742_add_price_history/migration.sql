-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "id" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(20,10) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceHistory_tokenMint_timestamp_idx" ON "public"."PriceHistory"("tokenMint", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "PriceHistory_symbol_timestamp_idx" ON "public"."PriceHistory"("symbol", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "PriceHistory_timestamp_idx" ON "public"."PriceHistory"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PriceHistory_tokenMint_timestamp_key" ON "public"."PriceHistory"("tokenMint", "timestamp");

-- CreateIndex
CREATE INDEX "Balance_walletId_lastUpdated_idx" ON "public"."Balance"("walletId", "lastUpdated" DESC);

-- CreateIndex
CREATE INDEX "Balance_usdValue_idx" ON "public"."Balance"("usdValue" DESC);

-- CreateIndex
CREATE INDEX "Cache_walletId_type_idx" ON "public"."Cache"("walletId", "type");

-- CreateIndex
CREATE INDEX "Cache_expiresAt_type_idx" ON "public"."Cache"("expiresAt", "type");

-- CreateIndex
CREATE INDEX "Position_walletId_lastUpdated_idx" ON "public"."Position"("walletId", "lastUpdated" DESC);

-- CreateIndex
CREATE INDEX "Position_protocol_lastUpdated_idx" ON "public"."Position"("protocol", "lastUpdated" DESC);

-- CreateIndex
CREATE INDEX "Position_usdValue_idx" ON "public"."Position"("usdValue" DESC);

-- CreateIndex
CREATE INDEX "TokenPrice_lastUpdated_idx" ON "public"."TokenPrice"("lastUpdated" DESC);

-- CreateIndex
CREATE INDEX "TokenPrice_symbol_lastUpdated_idx" ON "public"."TokenPrice"("symbol", "lastUpdated" DESC);

-- CreateIndex
CREATE INDEX "Transaction_walletAddress_blockTime_idx" ON "public"."Transaction"("walletAddress", "blockTime" DESC);

-- CreateIndex
CREATE INDEX "Transaction_protocol_blockTime_idx" ON "public"."Transaction"("protocol", "blockTime" DESC);
