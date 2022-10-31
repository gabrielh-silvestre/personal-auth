import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { TokenDocument, TokenSchema } from './Token.schema';
import { Token } from '@tokens/domain/entity/Token';
import { TokenFactory } from '@tokens/domain/factory/Token.factory';

@Injectable()
export class TokenMongooseRepository implements ITokenRepository {
  constructor(
    @InjectModel(TokenSchema.name)
    private readonly model: Model<TokenDocument>,
  ) {}

  async create(entity: Token): Promise<void> {
    const tokenAlreadyExists = await this.model.exists({
      userId: entity.userId,
      type: entity.type,
    });

    if (tokenAlreadyExists) {
      await this.model.findOneAndUpdate(
        { userId: entity.userId },
        {
          $set: {
            id: entity.id,
            lastRefresh: entity.lastRefresh,
            expires: entity.expires,
            revoked: entity.revoked,
          },
        },
      );
    } else {
      await new this.model({
        id: entity.id,
        userId: entity.userId,
        lastRefresh: entity.lastRefresh,
        expires: entity.expires,
        revoked: entity.revoked,
        type: entity.type,
      }).save();
    }
  }

  async update(entity: Token): Promise<void> {
    this.model.updateMany(
      {
        $or: [{ id: entity.id }, { userId: entity.userId }],
      },
      {
        $set: {
          userId: entity.userId,
          lastRefresh: entity.lastRefresh,
          expires: entity.expires,
          revoked: entity.revoked,
        },
      },
    );
  }

  async find(id: string): Promise<Token> {
    const foundToken = await this.model.findOne({ id });

    return foundToken
      ? TokenFactory.createTokenFromType(foundToken.type, foundToken.id)
      : null;
  }
}
