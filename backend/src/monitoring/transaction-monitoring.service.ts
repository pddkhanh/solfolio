import { Injectable, Logger } from '@nestjs/common';
import { Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { PositionChange } from './monitoring.interfaces';
import { ProtocolType } from '@prisma/client';

@Injectable()
export class TransactionMonitoringService {
  private readonly logger = new Logger(TransactionMonitoringService.name);
  private connection: Connection;

  // Known DeFi protocol program IDs
  private readonly DEFI_PROGRAMS = {
    MARINADE: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
    ORCA_WHIRLPOOL: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    RAYDIUM_V4: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    JUPITER: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    KAMINO: '6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc', // Kamino lending
  };

  constructor(
    private readonly heliusService: HeliusService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {
    this.connection = this.heliusService.getConnection();
  }

  async processTransaction(
    signature: string,
    walletAddress: string,
  ): Promise<PositionChange | null> {
    try {
      this.logger.log(
        `Processing transaction ${signature} for wallet ${walletAddress}`,
      );

      // Check if we've already processed this transaction
      const cached = await this.cacheService.get(`tx:${signature}`);
      if (cached) {
        this.logger.debug(`Transaction ${signature} already processed`);
        return null;
      }

      // Fetch transaction details
      const transaction = await this.fetchTransactionWithRetry(signature);
      if (!transaction) {
        this.logger.warn(`Transaction ${signature} not found`);
        return null;
      }

      // Analyze transaction for DeFi interactions
      const positionChange = this.analyzeTransaction(
        transaction,
        walletAddress,
      );

      if (positionChange) {
        // Store in database
        await this.storeTransaction(transaction, walletAddress, positionChange);

        // Cache to prevent reprocessing
        await this.cacheService.set(`tx:${signature}`, 'processed', 300); // 5 minutes
      }

      return positionChange;
    } catch (error) {
      this.logger.error(`Failed to process transaction ${signature}:`, error);
      return null;
    }
  }

  private async fetchTransactionWithRetry(
    signature: string,
    maxAttempts: number = 3,
  ): Promise<ParsedTransactionWithMeta | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const transaction = await this.connection.getParsedTransaction(
          signature,
          {
            maxSupportedTransactionVersion: 0,
          },
        );

        if (transaction) {
          return transaction;
        }

        // Wait before retry
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        this.logger.error(
          `Attempt ${attempt} failed to fetch transaction ${signature}:`,
          error,
        );
      }
    }

    return null;
  }

  private analyzeTransaction(
    transaction: ParsedTransactionWithMeta,
    walletAddress: string,
  ): PositionChange | null {
    try {
      // Check if transaction was successful
      if (transaction.meta?.err) {
        this.logger.debug(
          `Transaction failed: ${JSON.stringify(transaction.meta.err)}`,
        );
        return null;
      }

      // Find DeFi protocol interactions
      const programId = this.findDeFiProgramInteraction(transaction);
      if (!programId) {
        return null;
      }

      // Determine the protocol
      const protocol = this.getProtocolName(programId);
      if (!protocol) {
        return null;
      }

      // Analyze the specific protocol interaction
      const changeType = this.determineChangeType(transaction);

      // Extract value changes if possible
      const { previousValue, currentValue } = this.extractValueChanges();

      const positionChange: PositionChange = {
        walletAddress,
        protocol,
        previousValue,
        currentValue,
        changeType,
        transactionSignature: transaction.transaction.signatures[0],
        timestamp: new Date(transaction.blockTime! * 1000),
      };

      this.logger.log(
        `Detected ${protocol} ${changeType} for wallet ${walletAddress}`,
      );

      return positionChange;
    } catch (error) {
      this.logger.error('Failed to analyze transaction:', error);
      return null;
    }
  }

  private findDeFiProgramInteraction(
    transaction: ParsedTransactionWithMeta,
  ): string | null {
    const instructions = transaction.transaction.message.instructions;

    for (const instruction of instructions) {
      if ('programId' in instruction) {
        const programId = instruction.programId.toBase58();
        if (Object.values(this.DEFI_PROGRAMS).includes(programId)) {
          return programId;
        }
      }
    }

    // Check inner instructions
    if (transaction.meta?.innerInstructions) {
      for (const innerInstSet of transaction.meta.innerInstructions) {
        for (const instruction of innerInstSet.instructions) {
          if ('programId' in instruction) {
            const programId = instruction.programId.toBase58();
            if (Object.values(this.DEFI_PROGRAMS).includes(programId)) {
              return programId;
            }
          }
        }
      }
    }

    return null;
  }

  private getProtocolName(programId: string): string | null {
    const entries = Object.entries(this.DEFI_PROGRAMS);
    for (const [name, id] of entries) {
      if (id === programId) {
        return name.toLowerCase();
      }
    }
    return null;
  }

  private determineChangeType(
    transaction: ParsedTransactionWithMeta,
  ): 'deposit' | 'withdraw' | 'claim' | 'update' {
    // Analyze transaction logs to determine the type
    const logs = transaction.meta?.logMessages || [];

    // Look for common DeFi action keywords in logs
    const logString = logs.join(' ').toLowerCase();

    if (logString.includes('deposit') || logString.includes('stake')) {
      return 'deposit';
    } else if (
      logString.includes('withdraw') ||
      logString.includes('unstake')
    ) {
      return 'withdraw';
    } else if (logString.includes('claim') || logString.includes('harvest')) {
      return 'claim';
    }

    // Check token balance changes
    const preBalances = transaction.meta?.preTokenBalances || [];
    const postBalances = transaction.meta?.postTokenBalances || [];

    if (postBalances.length > preBalances.length) {
      return 'deposit';
    } else if (preBalances.length > postBalances.length) {
      return 'withdraw';
    }

    return 'update';
  }

  private extractValueChanges(): {
    previousValue?: number;
    currentValue?: number;
  } {
    try {
      // This would need to be implemented based on specific protocol logic
      // For now, return empty values
      return {
        previousValue: undefined,
        currentValue: undefined,
      };
    } catch (error) {
      this.logger.error('Failed to extract value changes:', error);
      return {
        previousValue: undefined,
        currentValue: undefined,
      };
    }
  }

  private async storeTransaction(
    transaction: ParsedTransactionWithMeta,
    walletAddress: string,
    positionChange: PositionChange,
  ) {
    try {
      await this.prisma.transaction.create({
        data: {
          signature: transaction.transaction.signatures[0],
          walletAddress,
          protocol: this.mapToProtocolType(positionChange.protocol),
          type: positionChange.changeType,
          amount: positionChange.currentValue?.toString(),
          blockTime: transaction.blockTime
            ? new Date(transaction.blockTime * 1000)
            : new Date(),
        },
      });

      this.logger.debug(
        `Stored transaction ${transaction.transaction.signatures[0]} in database`,
      );
    } catch (error) {
      // Ignore duplicate key errors
      if (error.code === 'P2002') {
        this.logger.debug('Transaction already exists in database');
      } else {
        this.logger.error('Failed to store transaction:', error);
      }
    }
  }

  async getRecentTransactions(
    walletAddress: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      return await this.prisma.transaction.findMany({
        where: {
          walletAddress,
        },
        orderBy: {
          blockTime: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Failed to get recent transactions:', error);
      return [];
    }
  }

  private mapToProtocolType(protocol: string): ProtocolType | null {
    const protocolMap: Record<string, ProtocolType> = {
      marinade: ProtocolType.MARINADE,
      kamino: ProtocolType.KAMINO,
      jito: ProtocolType.JITO,
      orca: ProtocolType.ORCA,
      raydium: ProtocolType.RAYDIUM,
      marginfi: ProtocolType.MARGINFI,
      solend: ProtocolType.SOLEND,
      drift: ProtocolType.DRIFT,
    };
    
    const normalized = protocol.toLowerCase();
    return protocolMap[normalized] || null;
  }
}
