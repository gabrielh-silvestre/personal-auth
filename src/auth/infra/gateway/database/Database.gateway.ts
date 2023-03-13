import { Inject, Injectable } from '@nestjs/common';

import type { TokenType } from '@auth/domain/entity/token.interface';
import type { IDatabaseGateway } from './Database.gateway.interface';
import type {
  IOrmAdapter,
  OrmTokenDto,
} from '@auth/infra/adapter/orm/Orm.adapter.interface';

import { Token } from '@auth/domain/entity/Token';
import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { ORM_ADAPTER } from '@auth/utils/constants';

@Injectable()
export class DatabaseGateway implements IDatabaseGateway {
  constructor(
    @Inject(ORM_ADAPTER)
    private readonly databaseAdapter: IOrmAdapter,
  ) {}

  private static convertToDomain(dto: OrmTokenDto): Token {
    return TokenFactory.createTokenFromPersistence(dto);
  }

  async find(id: string): Promise<Token> {
    const foundToken = await this.databaseAdapter.findOne({ id });
    return foundToken ? DatabaseGateway.convertToDomain(foundToken) : null;
  }

  async findByUserIdAndType(
    userId: string,
    type: TokenType,
  ): Promise<Token | null> {
    const foundToken = await this.databaseAdapter.findOne({
      userId,
      type,
    });

    return foundToken ? DatabaseGateway.convertToDomain(foundToken) : null;
  }

  async create(entity: Token): Promise<void> {
    await this.databaseAdapter.create(entity);
  }

  async update(entity: Token): Promise<void> {
    await this.databaseAdapter.update(entity);
  }
}
