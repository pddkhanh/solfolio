import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceStreamService } from './price-stream.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Price')
@Controller('price')
export class PriceController {
  constructor(
    private readonly priceService: PriceService,
    private readonly priceStreamService: PriceStreamService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get token prices' })
  @ApiQuery({
    name: 'mints',
    required: true,
    description: 'Comma-separated list of token mint addresses',
    example:
      'So11111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  })
  @ApiQuery({
    name: 'refresh',
    required: false,
    description: 'Force refresh prices from source',
    type: Boolean,
  })
  async getTokenPrices(
    @Query('mints') mints: string,
    @Query('refresh') refresh?: string,
  ) {
    if (!mints) {
      throw new HttpException(
        'mints parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const mintArray = mints.split(',').filter((m) => m.trim());
    if (mintArray.length === 0) {
      throw new HttpException(
        'At least one mint address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const forceRefresh = refresh === 'true';
    const prices = await this.priceService.getTokenPrices(
      mintArray,
      forceRefresh,
    );

    const result = Array.from(prices.entries()).map(([mint, price]) => ({
      mint,
      price,
    }));

    return {
      prices: result,
      count: result.length,
      cached: !forceRefresh,
    };
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate USD values for token amounts' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mint: { type: 'string' },
              amount: { type: 'string' },
              decimals: { type: 'number' },
              symbol: { type: 'string' },
            },
            required: ['mint', 'amount', 'decimals'],
          },
        },
      },
    },
  })
  async calculateUSDValues(
    @Body()
    body: {
      tokens: Array<{
        mint: string;
        amount: string;
        decimals: number;
        symbol?: string;
      }>;
    },
  ) {
    if (!body.tokens || !Array.isArray(body.tokens)) {
      throw new HttpException(
        'tokens array is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.priceService.calculateUSDValues(body.tokens);
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get price cache statistics' })
  getCacheStats() {
    return this.priceService.getCacheStats();
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear price cache' })
  clearCache() {
    this.priceService.clearCache();
    return { message: 'Cache cleared successfully' };
  }

  // Price Streaming Endpoints

  @Get('stream/status')
  @ApiOperation({ summary: 'Get price streaming status' })
  getStreamingStatus() {
    return this.priceStreamService.getStreamingStatus();
  }

  @Get('stream/tokens')
  @ApiOperation({ summary: 'Get tokens being streamed' })
  getStreamingTokens() {
    return {
      tokens: this.priceStreamService.getStreamingTokens(),
      count: this.priceStreamService.getStreamingTokens().length,
    };
  }

  @Post('stream/tokens/add')
  @ApiOperation({ summary: 'Add tokens to price stream' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of token mint addresses to add to stream',
          example: ['So11111111111111111111111111111111111112'],
        },
      },
      required: ['mints'],
    },
  })
  async addTokensToStream(@Body() body: { mints: string[] }) {
    if (!body.mints || !Array.isArray(body.mints)) {
      throw new HttpException(
        'mints array is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.mints.length === 0) {
      throw new HttpException(
        'At least one mint address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.priceStreamService.addTokensToStream(body.mints);
    return {
      message: `Added ${body.mints.length} tokens to stream`,
      tokens: body.mints,
    };
  }

  @Post('stream/tokens/remove')
  @ApiOperation({ summary: 'Remove tokens from price stream' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of token mint addresses to remove from stream',
        },
      },
      required: ['mints'],
    },
  })
  async removeTokensFromStream(@Body() body: { mints: string[] }) {
    if (!body.mints || !Array.isArray(body.mints)) {
      throw new HttpException(
        'mints array is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.priceStreamService.removeTokensFromStream(body.mints);
    return {
      message: `Removed ${body.mints.length} tokens from stream`,
      tokens: body.mints,
    };
  }

  @Post('stream/force-update')
  @ApiOperation({ summary: 'Force immediate price update' })
  async forceUpdate() {
    await this.priceStreamService.forceUpdate();
    return { message: 'Price update triggered successfully' };
  }
}
