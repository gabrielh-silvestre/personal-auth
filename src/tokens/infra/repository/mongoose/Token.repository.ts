import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { TokenDocument, TokenSchema } from './Token.schema';
import { Token } from '@tokens/domain/entity/Token';

@Injectable()
export class TokenMongooseRepository implements ITokenRepository {
  constructor(
    @InjectModel(TokenSchema.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {}

  async findByUserId(userId: string): Promise<Token[]> {
    const foundToken = await this.tokenModel.find({ userId });

    return foundToken.map(
      (token) =>
        new Token(
          token.id,
          token.userId,
          token.lastRefresh,
          token.revoked,
          token.type,
        ),
    );
  }

  async create(entity: Token): Promise<void> {
    new this.tokenModel({
      id: entity.id,
      userId: entity.userId,
      lastRefresh: entity.lastRefresh,
      expires: entity.expires,
      revoked: entity.revoked,
      type: entity.type,
    }).save();
  }

  async update(entity: Token): Promise<void> {
    await this.tokenModel.updateMany(
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
    const foundToken = await this.tokenModel.findOne({ id });

    return new Token(
      foundToken.id,
      foundToken.userId,
      foundToken.lastRefresh,
      foundToken.revoked,
      foundToken.type,
    );
  }
}
