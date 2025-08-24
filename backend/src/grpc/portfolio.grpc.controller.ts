import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PortfolioGrpcService } from './portfolio.grpc.service';

@Controller()
export class PortfolioGrpcController {
  constructor(private readonly portfolioGrpcService: PortfolioGrpcService) {}

  @GrpcMethod('PortfolioService', 'GetPortfolio')
  getPortfolio(data: any) {
    return this.portfolioGrpcService.getPortfolio(data);
  }

  @GrpcMethod('PortfolioService', 'GetTokenBalances')
  getTokenBalances(data: any) {
    return this.portfolioGrpcService.getTokenBalances(data);
  }

  @GrpcMethod('PortfolioService', 'GetPositions')
  getPositions(data: any) {
    return this.portfolioGrpcService.getPositions(data);
  }

  @GrpcMethod('PortfolioService', 'GetPrices')
  getPrices(data: any) {
    return this.portfolioGrpcService.getPrices(data);
  }

  @GrpcStreamMethod('PortfolioService', 'SubscribeToUpdates')
  subscribeToUpdates(data: Observable<any>): Observable<any> {
    return this.portfolioGrpcService.subscribeToUpdates(data);
  }

  @GrpcMethod('PortfolioService', 'HealthCheck')
  healthCheck(data: any) {
    return this.portfolioGrpcService.healthCheck(data);
  }
}