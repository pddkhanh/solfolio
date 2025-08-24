import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';

interface BatchRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  key: string;
}

interface BatchContext<T> {
  requests: BatchRequest<T>[];
  timer?: NodeJS.Timeout;
}

@Injectable()
export class RpcBatchService {
  private readonly logger = new Logger(RpcBatchService.name);
  private readonly batchDelay = 10; // milliseconds
  private readonly maxBatchSize = 100; // Maximum accounts per batch request

  // Batch contexts for different types of requests
  private accountInfoBatch: BatchContext<AccountInfo<Buffer> | null> = {
    requests: [],
  };
  private balanceBatch: BatchContext<number> = { requests: [] };

  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  /**
   * Batch multiple getAccountInfo requests into a single getMultipleAccountsInfo call
   */
  async getAccountInfo(
    connection: Connection,
    publicKey: PublicKey,
  ): Promise<AccountInfo<Buffer> | null> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest<AccountInfo<Buffer> | null> = {
        resolve,
        reject,
        key: publicKey.toBase58(),
      };

      this.accountInfoBatch.requests.push(request);

      // If batch is full, execute immediately
      if (this.accountInfoBatch.requests.length >= this.maxBatchSize) {
        void this.executeAccountInfoBatch(connection);
      } else {
        // Otherwise, schedule batch execution
        this.scheduleAccountInfoBatch(connection);
      }
    });
  }

  /**
   * Batch multiple getBalance requests
   */
  async getBalance(
    connection: Connection,
    publicKey: PublicKey,
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest<number> = {
        resolve,
        reject,
        key: publicKey.toBase58(),
      };

      this.balanceBatch.requests.push(request);

      // If batch is full, execute immediately
      if (this.balanceBatch.requests.length >= this.maxBatchSize) {
        void this.executeBalanceBatch(connection);
      } else {
        // Otherwise, schedule batch execution
        this.scheduleBalanceBatch(connection);
      }
    });
  }

  /**
   * Get multiple token accounts with batching
   */
  async getMultipleTokenAccounts(
    connection: Connection,
    publicKeys: PublicKey[],
  ): Promise<(AccountInfo<Buffer> | null)[]> {
    if (publicKeys.length === 0) {
      return [];
    }

    // For large batches, split into smaller chunks
    const chunks: PublicKey[][] = [];
    for (let i = 0; i < publicKeys.length; i += this.maxBatchSize) {
      chunks.push(publicKeys.slice(i, i + this.maxBatchSize));
    }

    const results = await Promise.all(
      chunks.map((chunk) => this.fetchMultipleAccounts(connection, chunk)),
    );

    return results.flat();
  }

  private scheduleAccountInfoBatch(connection: Connection) {
    if (this.accountInfoBatch.timer) {
      return;
    }

    this.accountInfoBatch.timer = setTimeout(() => {
      void this.executeAccountInfoBatch(connection);
    }, this.batchDelay);
  }

  private scheduleBalanceBatch(connection: Connection) {
    if (this.balanceBatch.timer) {
      return;
    }

    this.balanceBatch.timer = setTimeout(() => {
      void this.executeBalanceBatch(connection);
    }, this.batchDelay);
  }

  private async executeAccountInfoBatch(connection: Connection) {
    const batch = this.accountInfoBatch;
    this.accountInfoBatch = { requests: [] };

    if (batch.timer) {
      clearTimeout(batch.timer);
    }

    if (batch.requests.length === 0) {
      return;
    }

    const publicKeys = batch.requests.map((req) => new PublicKey(req.key));

    try {
      this.logger.debug(
        `Batching ${batch.requests.length} getAccountInfo requests`,
      );

      const accounts = await this.fetchMultipleAccounts(connection, publicKeys);

      // Resolve individual promises with their corresponding results
      batch.requests.forEach((request, index) => {
        request.resolve(accounts[index]);
      });

      this.logger.debug(
        `Successfully batched ${batch.requests.length} account info requests`,
      );
    } catch (error) {
      this.logger.error('Failed to execute account info batch', error);
      // Reject all promises in the batch
      batch.requests.forEach((request) => {
        request.reject(error as Error);
      });
    }
  }

  private async executeBalanceBatch(connection: Connection) {
    const batch = this.balanceBatch;
    this.balanceBatch = { requests: [] };

    if (batch.timer) {
      clearTimeout(batch.timer);
    }

    if (batch.requests.length === 0) {
      return;
    }

    const publicKeys = batch.requests.map((req) => new PublicKey(req.key));

    try {
      this.logger.debug(
        `Batching ${batch.requests.length} getBalance requests`,
      );

      // Use getMultipleAccountsInfo to get balances in a single request
      const accounts = await this.fetchMultipleAccounts(connection, publicKeys);

      // Extract balances from accounts
      batch.requests.forEach((request, index) => {
        const account = accounts[index];
        const balance = account ? account.lamports : 0;
        request.resolve(balance);
      });

      this.logger.debug(
        `Successfully batched ${batch.requests.length} balance requests`,
      );
    } catch (error) {
      this.logger.error('Failed to execute balance batch', error);
      // Reject all promises in the batch
      batch.requests.forEach((request) => {
        request.reject(error as Error);
      });
    }
  }

  private async fetchMultipleAccounts(
    connection: Connection,
    publicKeys: PublicKey[],
  ): Promise<(AccountInfo<Buffer> | null)[]> {
    await this.rateLimiter.waitForSlot();

    return this.connectionManager.executeWithRetry(async () => {
      const result = await connection.getMultipleAccountsInfo(publicKeys);
      return result;
    });
  }

  /**
   * Batch multiple getParsedTokenAccountsByOwner calls for different owners
   */
  async batchGetParsedTokenAccountsByOwner(
    connection: Connection,
    owners: PublicKey[],
    programId: PublicKey,
  ): Promise<Map<string, any[]>> {
    const results = new Map<string, any[]>();

    // Execute in parallel with rate limiting
    const batchSize = 10; // Process 10 owners at a time
    for (let i = 0; i < owners.length; i += batchSize) {
      const batch = owners.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (owner) => {
          await this.rateLimiter.waitForSlot();
          const accounts = await this.connectionManager.executeWithRetry(
            async () => {
              const response = await connection.getParsedTokenAccountsByOwner(
                owner,
                { programId },
              );
              return response.value;
            },
          );
          return { owner: owner.toBase58(), accounts };
        }),
      );

      batchResults.forEach(({ owner, accounts }) => {
        results.set(owner, accounts);
      });
    }

    return results;
  }

  /**
   * Optimize token metadata fetching by batching requests
   */
  async batchGetTokenMetadata(
    connection: Connection,
    mints: PublicKey[],
  ): Promise<Map<string, any>> {
    const metadataMap = new Map<string, any>();

    if (mints.length === 0) {
      return metadataMap;
    }

    // Get account info for all mints in batches
    const accounts = await this.getMultipleTokenAccounts(connection, mints);

    accounts.forEach((account, index) => {
      if (account) {
        const mint = mints[index].toBase58();
        // Parse metadata from account data if available
        metadataMap.set(mint, {
          mint,
          // Additional metadata parsing would go here
        });
      }
    });

    return metadataMap;
  }

  /**
   * Clear all pending batches (useful for cleanup)
   */
  clearPendingBatches() {
    if (this.accountInfoBatch.timer) {
      clearTimeout(this.accountInfoBatch.timer);
    }
    if (this.balanceBatch.timer) {
      clearTimeout(this.balanceBatch.timer);
    }

    // Reject all pending requests
    const error = new Error('Batch cleared');
    this.accountInfoBatch.requests.forEach((req) => req.reject(error));
    this.balanceBatch.requests.forEach((req) => req.reject(error));

    this.accountInfoBatch = { requests: [] };
    this.balanceBatch = { requests: [] };
  }
}
