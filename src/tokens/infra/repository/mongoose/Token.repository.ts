import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { Token } from '@tokens/domain/entity/Token';
import { TokenType } from '@tokens/domain/entity/token.interface';

import { TokenDocument, TokenSchema } from './Token.schema';

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
        expireTime: entity.expireTime,
        lastRefresh: entity.lastRefresh,
        expires: entity.expires,
        revoked: entity.revoked,
        type: entity.type,
      }).save();
    }
  }

  async update(entity: Token): Promise<void> {
    await this.model.findOneAndUpdate(
      {
        id: entity.id,
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
      ? new Token(
          foundToken.id,
          foundToken.userId,
          foundToken.expireTime,
          foundToken.lastRefresh,
          foundToken.revoked,
          foundToken.type,
        )
      : null;
  }

  async findByUserIdAndType(
    userId: string,
    type: TokenType,
  ): Promise<Token | null> {
    const foundToken = await this.model.findOne({ userId, type });

    return foundToken
      ? new Token(
          foundToken.id,
          foundToken.userId,
          foundToken.expireTime,
          foundToken.lastRefresh,
          foundToken.revoked,
          foundToken.type,
        )
      : null;
  }
}
