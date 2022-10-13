import { Controller, UseFilters } from '@nestjs/common/decorators';
import { GrpcMethod } from '@nestjs/microservices';

import { TokenService } from '@tokens/token.service';
import { ExceptionFilterRpc } from '@users/infra/grpc/server/filter/ExceptionFilter.grpc';

@Controller()
@UseFilters(new ExceptionFilterRpc())
export class TokenGrpcServerController {
  constructor(private readonly tokenService: TokenService) {}

  @GrpcMethod('TokenService')
  async revokeToken(data: { token: string }): Promise<{ success: boolean }> {
    const isTokenRevoked = await this.tokenService.revokeToken(data.token);
    return { success: isTokenRevoked };
  }
}
