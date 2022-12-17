import { Inject, Injectable } from '@nestjs/common';

import type { InputGenerateTokenDto } from './GenerateToken.dto';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class GenerateTokenUseCase {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute({
    userId,
    type,
  }: InputGenerateTokenDto): Promise<string | never> {
    if (type === 'recover') {
      return this.tokenGateway.generateRecoverPasswordToken(userId);
    }

    throw ExceptionFactory.nonAcceptable('Invalid token type');
  }
}
