import { Inject, Injectable } from '@nestjs/common';

import type {
  InputRevokeTokenDto,
  OutputRevokeTokenDto,
} from '#auth/useCase/revokeToken/RevokeToken.dto';
import type { IDatabaseGateway } from '#auth/infra/gateway/database/database.gateway.interface';

import { ExceptionFactory } from '#exceptions/factory/Exception.factory';

import { DATABASE_GATEWAY } from '#auth/utils/constants/index';

@Injectable()
export class RevokeTokenUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
  ) {}

  async execute({
    tokenId,
  }: InputRevokeTokenDto): Promise<OutputRevokeTokenDto | never> {
    const foundToken = await this.databaseGateway.find(tokenId);

    if (!foundToken) throw ExceptionFactory.notFound('Token not found');

    foundToken.revoke();
    await this.databaseGateway.update(foundToken);

    return { revoked: true };
  }
}
