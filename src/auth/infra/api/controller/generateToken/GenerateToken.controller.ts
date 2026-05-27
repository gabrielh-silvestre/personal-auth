import { Controller, UseFilters } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import type { GenerateTokenType } from '@auth/useCase/generateToken/GenerateToken.dto';

import { GenerateTokenUseCase } from '@auth/useCase/generateToken/GenerateToken.useCase';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

import { Telemetry } from '@shared/modules/telemetry/telemetry';
import { AttributeKeys, Transport } from '@shared/modules/telemetry/constants';
import { withExtractedAmqpContext } from '@shared/modules/telemetry/helpers';

@Controller()
export class GenerateTokenController {
  constructor(
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    private readonly jwtAccess: JwtAccessService,
  ) {}

  private async handle(data: {
    userId: string;
    type: GenerateTokenType;
  }): Promise<string> {
    const tokenId = await this.generateTokenUseCase.execute(data);

    Telemetry.setAttributes({
      [AttributeKeys.AUTH_USER_ID]: data.userId,
      [AttributeKeys.AUTH_TOKEN_TYPE]: data.type,
      [AttributeKeys.AUTH_TRANSPORT]: Transport.RMQ,
    });

    return this.jwtAccess.sign({ tokenId, userId: data.userId });
  }

  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.generate_recover_token')
  async handleRecoverToken(
    @Payload() { userId }: { userId: string },
    @Ctx() ctx?: RmqContext,
  ): Promise<string | never> {
    return withExtractedAmqpContext(
      ctx?.getMessage?.()?.properties,
      'GenerateTokenController.handleRecoverToken',
      () => this.handle({ userId, type: 'recover' }),
    );
  }
}
