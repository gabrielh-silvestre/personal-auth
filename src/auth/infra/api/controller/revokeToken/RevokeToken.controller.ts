import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Ctx, GrpcMethod, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import type { AuthenticatedMessageDto } from '@auth/infra/strategy/VerifyTokenMessage.dto';

import { RevokeTokenUseCase } from '@auth/useCase/revokeToken/RevokeToken.useCase';
import { RmqService } from '@shared/modules/rmq/rmq.service';

import { AuthenticateGuard } from '../../guard/Authenticate.guard';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

@Controller()
export class RevokeTokenController {
  constructor(
    private readonly revokeTokenUseCase: RevokeTokenUseCase,
    private readonly rmqService: RmqService,
  ) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.revoke_token')
  async handle(
    @Payload() data: AuthenticatedMessageDto,
    @Ctx() context: RmqContext,
  ): Promise<{ revoked: boolean } | never> {
    try {
      const result = await this.revokeTokenUseCase.execute({
        tokenId: data.user.tokenId,
      });
      this.rmqService.ack(context);
      return result;
    } catch (error) {
      this.rmqService.nack(context);
      throw error;
    }
  }

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('TokenService', 'RevokeToken')
  async handleGrpc(
    @Payload() data: AuthenticatedMessageDto,
  ): Promise<{ success: boolean } | never> {
    const { revoked } = await this.revokeTokenUseCase.execute({
      tokenId: data.user.tokenId,
    });

    return { success: revoked };
  }
}
