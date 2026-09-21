import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { IToken } from '#auth/domain/entity/token.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { Token } from '#auth/domain/entity/Token';

import {
  TokenDocument,
  TokenSchema,
} from '#auth/infra/adapter/database/mongoose/MongooseSchema';

@Injectable()
export class DatabaseMongooseAdapter implements IDatabaseAdapter {
  constructor(
    @InjectModel(TokenSchema.name)
    private readonly model: Model<TokenDocument>,
  ) {}

  private modelToDomain(model: TokenDocument): Token {
    return new Token(
      model.id,
      model.userId,
      model.expireTime,
      model.lastRefresh,
      model.revoked,
      model.type,
    );
  }

  async findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null> {
    const foundToken = await this.model.findOne(dto).exec();

    return foundToken ? this.modelToDomain(foundToken) : null;
  }

  async create(entity: Token): Promise<void> {
    await this.model
      .findOneAndUpdate(
        {
          userId: entity.userId,
          type: entity.type,
        },
        {
          $set: {
            id: entity.id,
            expireTime: entity.expireTime,
            lastRefresh: entity.lastRefresh,
            expires: entity.expires,
            revoked: entity.revoked,
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async update(entity: Token): Promise<void> {
    await this.model
      .findOneAndUpdate(
        {
          id: entity.id,
        },
        {
          $set: {
            lastRefresh: entity.lastRefresh,
            expires: entity.expires,
            revoked: entity.revoked,
          },
        },
      )
      .exec();
  }
}
