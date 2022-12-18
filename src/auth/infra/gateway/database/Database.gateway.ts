import { Inject, Injectable } from '@nestjs/common';

import type { TokenType } from '@auth/domain/entity/token.interface';
import type { IDatabaseGateway } from './Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

import { DATABASE_ADAPTER } from '@auth/utils/constants';

@Injectable()
export class DatabaseGateway implements IDatabaseGateway {
  constructor(
    @Inject(DATABASE_ADAPTER)
    private readonly databaseAdapter: IDatabaseAdapter,
  ) {}

  async find(id: string): Promise<Token> {
    return this.databaseAdapter.findOne({ id });
  }

  async findByUserIdAndType(
    userId: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.databaseAdapter.findOne({
      userId,
      type,
    });
  }

  async create(entity: Token): Promise<void> {
    await this.databaseAdapter.create(entity);
  }

  async update(entity: Token): Promise<void> {
    await this.databaseAdapter.update(entity);
  }
}
