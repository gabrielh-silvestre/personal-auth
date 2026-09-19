import { Inject, Injectable } from '@nestjs/common';

import type { InputGenerateTokenDto } from './GenerateToken.dto.js';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/database.gateway.interface.js';

import { TokenFactory } from '@auth/domain/factory/Token.factory.js';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory.js';

import { DATABASE_GATEWAY } from '@auth/utils/constants/index.js';

@Injectable()
export class GenerateTokenUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
  ) {}

  async execute({
    userId,
    type,
  }: InputGenerateTokenDto): Promise<string | never> {
    if (type !== 'recover') {
      throw ExceptionFactory.nonAcceptable('Invalid token type');
    }

    const newToken = TokenFactory.createRecoverPasswordToken(userId);

    await this.databaseGateway.create(newToken);

    return newToken.id;
  }
}
