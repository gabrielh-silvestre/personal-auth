import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseAdapter } from '../Database.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

import { TokenDocument, TokenSchema } from './MongooseSchema';

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

  private domainToModel(domain: Token) {
    return new this.model({
      id: domain.id,
      userId: domain.userId,
      expireTime: domain.expireTime,
      lastRefresh: domain.lastRefresh,
      expires: domain.expires,
      revoked: domain.revoked,
      type: domain.type,
    });
  }

  async findAll(): Promise<Token[]> {
    const foundTokens = await this.model.find().exec();

    return foundTokens.map((token) => this.modelToDomain(token));
  }

  async findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null> {
    const foundToken = await this.model.findOne(dto).exec();

    return !!foundToken ? this.modelToDomain(foundToken) : null;
  }

  async create(entity: Token): Promise<void> {
    const tokenAlreadyExists = await this.findOne({
      userId: entity.userId,
      type: entity.type,
    });

    if (tokenAlreadyExists) {
      await this.update(entity);
    } else {
      await this.domainToModel(entity).save();
    }
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

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id }).exec();
  }
}
