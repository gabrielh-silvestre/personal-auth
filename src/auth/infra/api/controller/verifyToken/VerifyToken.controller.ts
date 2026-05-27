import type { Request } from 'express';

import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import type { OutputVerifyTokenDto } from '@auth/useCase/verifyToken/VerifyToken.dto';

import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase';

import { AuthenticateGuard } from '../../guard/Authenticate.guard';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

import { Telemetry } from '@shared/modules/telemetry/telemetry';
import { AttributeKeys, Transport } from '@shared/modules/telemetry/constants';
import { withExtractedAmqpContext } from '@shared/modules/telemetry/helpers';

@Controller()
export class VerifyTokenController {
  constructor(private readonly verifyTokenUseCase: VerifyTokenUseCase) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.verify_token')
  async handle(
    @Payload() data: Request,
    @Ctx() ctx?: RmqContext,
  ): Promise<OutputVerifyTokenDto | never> {
    return withExtractedAmqpContext(
      ctx?.getMessage?.()?.properties,
      'VerifyTokenController.handle',
      async () => {
        const { userId } = await this.verifyTokenUseCase.execute({
          tokenId: data.user.tokenId,
        });
        Telemetry.setAttributes({
          [AttributeKeys.AUTH_USER_ID]: userId,
          [AttributeKeys.AUTH_TRANSPORT]: Transport.RMQ,
        });
        return { userId };
      },
    );
  }
}
