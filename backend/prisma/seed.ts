import { PrismaClient, ProtocolType, PositionType, CacheType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing data
  await prisma.transaction.deleteMany();
  await prisma.cache.deleteMany();
  await prisma.position.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.tokenPrice.deleteMany();
  await prisma.protocolApy.deleteMany();
  await prisma.marinadeData.deleteMany();

  // Create test wallet
  const wallet = await prisma.wallet.create({
    data: {
      address: '7yK8HfqW2nG9JZjmVfKxQgR3nxknUkgqPgzqmtkJbpEz',
    },
  });

  console.log('Created wallet:', wallet.address);

  // Create token prices
  const solPrice = await prisma.tokenPrice.create({
    data: {
      tokenMint: 'So11111111111111111111111111111111111111112', // SOL
      symbol: 'SOL',
      price: 150.45,
      priceChange24h: 5.23,
      volume24h: 1234567890.12,
      marketCap: 65432109876.54,
    },
  });

  const msolPrice = await prisma.tokenPrice.create({
    data: {
      tokenMint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
      symbol: 'mSOL',
      price: 165.49,
      priceChange24h: 5.18,
      volume24h: 12345678.90,
      marketCap: 654321098.76,
    },
  });

  const usdcPrice = await prisma.tokenPrice.create({
    data: {
      tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      symbol: 'USDC',
      price: 1.0,
      priceChange24h: 0.01,
      volume24h: 9876543210.12,
      marketCap: 28765432109.87,
    },
  });

  console.log('Created token prices');

  // Create test balances
  await prisma.balance.createMany({
    data: [
      {
        walletId: wallet.id,
        tokenMint: 'So11111111111111111111111111111111111111112',
        amount: 10.5,
        decimals: 9,
        usdValue: 10.5 * 150.45,
        symbol: 'SOL',
        name: 'Solana',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      },
      {
        walletId: wallet.id,
        tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 250.75,
        decimals: 6,
        usdValue: 250.75,
        symbol: 'USDC',
        name: 'USD Coin',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      },
    ],
  });

  console.log('Created test balances');

  // Create Marinade data
  const marinadeData = await prisma.marinadeData.create({
    data: {
      exchangeRate: 1.1, // 1 mSOL = 1.1 SOL
      totalStaked: 8000000,
      apy: 7.2,
      validatorCount: 450,
      epochInfo: {
        epoch: 500,
        slotIndex: 123456,
        slotsInEpoch: 432000,
        absoluteSlot: 216123456,
        blockHeight: 200000000,
      },
    },
  });

  console.log('Created Marinade data');

  // Create Marinade APY data
  await prisma.protocolApy.create({
    data: {
      protocol: ProtocolType.MARINADE,
      tokenMint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      apy: 7.2,
      metadata: {
        baseApy: 6.8,
        bonusApy: 0.4,
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  console.log('Created protocol APY data');

  // Create a test Marinade position
  const msolAmount = 5.0;
  const solValue = msolAmount * 1.1; // Using exchange rate
  const usdValue = solValue * 150.45;

  await prisma.position.create({
    data: {
      walletId: wallet.id,
      protocol: ProtocolType.MARINADE,
      positionType: PositionType.STAKING,
      tokenMint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      amount: msolAmount,
      underlyingMint: 'So11111111111111111111111111111111111111112',
      underlyingAmount: solValue,
      usdValue: usdValue,
      apy: 7.2,
      rewards: 0.015, // Some accumulated rewards
      metadata: {
        stakingAccount: 'StakeAccount123456789',
        validatorVote: 'MarinadeValidator123',
        activationEpoch: 495,
      },
    },
  });

  console.log('Created test Marinade position');

  // Create cache entries
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  await prisma.cache.createMany({
    data: [
      {
        key: `price:SOL`,
        type: CacheType.PRICE,
        value: { price: 150.45, lastUpdated: now.toISOString() },
        expiresAt: fiveMinutesFromNow,
      },
      {
        key: `position:${wallet.address}:MARINADE`,
        type: CacheType.POSITION,
        value: {
          protocol: 'MARINADE',
          amount: msolAmount,
          value: usdValue,
          apy: 7.2,
        },
        walletId: wallet.id,
        expiresAt: new Date(now.getTime() + 1 * 60 * 1000), // 1 minute cache
      },
    ],
  });

  console.log('Created cache entries');

  // Create sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        signature: 'sig123456789stake',
        walletAddress: wallet.address,
        protocol: ProtocolType.MARINADE,
        type: 'stake',
        amount: 5.0,
        tokenMint: 'So11111111111111111111111111111111111111112',
        usdValue: 5.0 * 150.45,
        blockTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: {
          msolReceived: msolAmount,
          exchangeRate: 1.1,
        },
      },
      {
        signature: 'sig123456789rewards',
        walletAddress: wallet.address,
        protocol: ProtocolType.MARINADE,
        type: 'rewards',
        amount: 0.015,
        tokenMint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        usdValue: 0.015 * 1.1 * 150.45,
        blockTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        metadata: {
          epochNumber: 500,
        },
      },
    ],
  });

  console.log('Created sample transactions');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });