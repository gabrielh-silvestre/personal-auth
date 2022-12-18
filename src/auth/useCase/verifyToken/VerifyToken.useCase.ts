import { Inject, Injectable } from '@nestjs/common';

import type {
  InputVerifyTokenDto,
  OutputVerifyTokenDto,
} from './VerifyToken.dto';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';

import { Token } from '@auth/domain/entity/Token';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { DATABASE_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class VerifyTokenUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
  ) {}

  private async foundValidToken(tokenId: string): Promise<Token | null> {
    const foundToken = await this.databaseGateway.find(tokenId);

    if (!foundToken) return null;
    if (!foundToken.isValid()) return null;

    return foundToken;
  }

  async execute({
    tokenId,
  }: InputVerifyTokenDto): Promise<OutputVerifyTokenDto | never> {
    const foundToken = await this.foundValidToken(tokenId);

    if (!foundToken) throw ExceptionFactory.unauthorized('Invalid token');

    return {
      userId: foundToken.userId,
    };
  }
}
