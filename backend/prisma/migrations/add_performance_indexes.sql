-- Add performance indexes for common query patterns

-- Composite indexes for frequently joined queries
CREATE INDEX IF NOT EXISTS idx_position_wallet_updated ON "Position" ("walletId", "lastUpdated" DESC);
CREATE INDEX IF NOT EXISTS idx_position_protocol_updated ON "Position" ("protocol", "lastUpdated" DESC);
CREATE INDEX IF NOT EXISTS idx_position_usd_value ON "Position" ("usdValue" DESC);

-- Optimize Balance queries
CREATE INDEX IF NOT EXISTS idx_balance_wallet_updated ON "Balance" ("walletId", "lastUpdated" DESC);
CREATE INDEX IF NOT EXISTS idx_balance_usd_value ON "Balance" ("usdValue" DESC) WHERE "usdValue" IS NOT NULL;

-- Optimize TokenPrice queries for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_price_updated ON "TokenPrice" ("lastUpdated" DESC);
CREATE INDEX IF NOT EXISTS idx_token_price_symbol_updated ON "TokenPrice" ("symbol", "lastUpdated" DESC);

-- Optimize Cache queries for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expired ON "Cache" ("expiresAt", "type") WHERE "expiresAt" < NOW();
CREATE INDEX IF NOT EXISTS idx_cache_wallet_type ON "Cache" ("walletId", "type") WHERE "walletId" IS NOT NULL;

-- Optimize Transaction queries
CREATE INDEX IF NOT EXISTS idx_transaction_wallet_time ON "Transaction" ("walletAddress", "blockTime" DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_protocol_time ON "Transaction" ("protocol", "blockTime" DESC) WHERE "protocol" IS NOT NULL;

-- Partial indexes for specific query patterns
CREATE INDEX IF NOT EXISTS idx_position_high_value ON "Position" ("walletId", "usdValue" DESC) WHERE "usdValue" > 100;
CREATE INDEX IF NOT EXISTS idx_balance_non_zero ON "Balance" ("walletId", "tokenMint") WHERE "amount" > 0;

-- BRIN indexes for time-series data (more efficient for large tables)
CREATE INDEX IF NOT EXISTS idx_transaction_blocktime_brin ON "Transaction" USING BRIN ("blockTime");
CREATE INDEX IF NOT EXISTS idx_cache_created_brin ON "Cache" USING BRIN ("createdAt");

-- GIN index for JSON metadata queries (if needed)
CREATE INDEX IF NOT EXISTS idx_position_metadata_gin ON "Position" USING GIN ("metadata") WHERE "metadata" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transaction_metadata_gin ON "Transaction" USING GIN ("metadata") WHERE "metadata" IS NOT NULL;

-- Analyze tables to update statistics for query planner
ANALYZE "Wallet";
ANALYZE "Position";
ANALYZE "Balance";
ANALYZE "TokenPrice";
ANALYZE "Cache";
ANALYZE "Transaction";