-- CreateEnum
CREATE TYPE "public"."ProtocolType" AS ENUM ('MARINADE', 'KAMINO', 'JITO', 'ORCA', 'RAYDIUM', 'MARGINFI', 'SOLEND', 'DRIFT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PositionType" AS ENUM ('STAKING', 'LENDING', 'BORROWING', 'LP_POSITION', 'VAULT', 'FARMING', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CacheType" AS ENUM ('PRICE', 'POSITION', 'BALANCE', 'APY', 'METADATA');

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Position" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "protocol" "public"."ProtocolType" NOT NULL,
    "positionType" "public"."PositionType" NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "amount" DECIMAL(30,10) NOT NULL,
    "underlyingMint" TEXT,
    "underlyingAmount" DECIMAL(30,10),
    "usdValue" DECIMAL(20,2) NOT NULL,
    "apy" DECIMAL(10,4),
    "rewards" DECIMAL(30,10),
    "metadata" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Balance" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "amount" DECIMAL(30,10) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "usdValue" DECIMAL(20,2),
    "symbol" TEXT,
    "name" TEXT,
    "logoUri" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TokenPrice" (
    "id" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(20,10) NOT NULL,
    "priceChange24h" DECIMAL(10,4),
    "volume24h" DECIMAL(20,2),
    "marketCap" DECIMAL(20,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtocolApy" (
    "id" TEXT NOT NULL,
    "protocol" "public"."ProtocolType" NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "apy" DECIMAL(10,4) NOT NULL,
    "metadata" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolApy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "public"."CacheType" NOT NULL,
    "value" JSONB NOT NULL,
    "walletId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MarinadeData" (
    "id" TEXT NOT NULL,
    "msolMint" TEXT NOT NULL DEFAULT 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    "exchangeRate" DECIMAL(20,10) NOT NULL,
    "totalStaked" DECIMAL(30,10) NOT NULL,
    "apy" DECIMAL(10,4) NOT NULL,
    "epochInfo" JSONB,
    "validatorCount" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarinadeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "protocol" "public"."ProtocolType",
    "type" TEXT NOT NULL,
    "amount" DECIMAL(30,10),
    "tokenMint" TEXT,
    "usdValue" DECIMAL(20,2),
    "metadata" JSONB,
    "blockTime" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "public"."Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "public"."Wallet"("address");

-- CreateIndex
CREATE INDEX "Position_walletId_protocol_idx" ON "public"."Position"("walletId", "protocol");

-- CreateIndex
CREATE INDEX "Position_tokenMint_idx" ON "public"."Position"("tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "Position_walletId_protocol_tokenMint_key" ON "public"."Position"("walletId", "protocol", "tokenMint");

-- CreateIndex
CREATE INDEX "Balance_walletId_idx" ON "public"."Balance"("walletId");

-- CreateIndex
CREATE INDEX "Balance_tokenMint_idx" ON "public"."Balance"("tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_walletId_tokenMint_key" ON "public"."Balance"("walletId", "tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "TokenPrice_tokenMint_key" ON "public"."TokenPrice"("tokenMint");

-- CreateIndex
CREATE INDEX "TokenPrice_tokenMint_idx" ON "public"."TokenPrice"("tokenMint");

-- CreateIndex
CREATE INDEX "TokenPrice_symbol_idx" ON "public"."TokenPrice"("symbol");

-- CreateIndex
CREATE INDEX "ProtocolApy_protocol_tokenMint_idx" ON "public"."ProtocolApy"("protocol", "tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolApy_protocol_tokenMint_key" ON "public"."ProtocolApy"("protocol", "tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "Cache_key_key" ON "public"."Cache"("key");

-- CreateIndex
CREATE INDEX "Cache_key_type_idx" ON "public"."Cache"("key", "type");

-- CreateIndex
CREATE INDEX "Cache_walletId_idx" ON "public"."Cache"("walletId");

-- CreateIndex
CREATE INDEX "Cache_expiresAt_idx" ON "public"."Cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarinadeData_msolMint_key" ON "public"."MarinadeData"("msolMint");

-- CreateIndex
CREATE INDEX "MarinadeData_msolMint_idx" ON "public"."MarinadeData"("msolMint");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_signature_key" ON "public"."Transaction"("signature");

-- CreateIndex
CREATE INDEX "Transaction_walletAddress_idx" ON "public"."Transaction"("walletAddress");

-- CreateIndex
CREATE INDEX "Transaction_signature_idx" ON "public"."Transaction"("signature");

-- CreateIndex
CREATE INDEX "Transaction_blockTime_idx" ON "public"."Transaction"("blockTime");

-- AddForeignKey
ALTER TABLE "public"."Position" ADD CONSTRAINT "Position_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Balance" ADD CONSTRAINT "Balance_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cache" ADD CONSTRAINT "Cache_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
