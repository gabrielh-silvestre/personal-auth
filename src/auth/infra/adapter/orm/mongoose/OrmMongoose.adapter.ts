import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { IToken } from '@auth/domain/entity/token.interface';
import type { IOrmAdapter, OrmTokenDto } from '../Orm.adapter.interface';

import { TokenDocument, TokenSchema } from './MongooseSchema';

@Injectable()
export class OrmMongooseAdapter implements IOrmAdapter {
  constructor(
    @InjectModel(TokenSchema.name)
    private readonly model: Model<TokenDocument>,
  ) {}

  async findAll(): Promise<OrmTokenDto[]> {
    const foundTokens = await this.model.find().exec();

    return foundTokens;
  }

  async findOne<T extends Partial<IToken>>(
    dto: T,
  ): Promise<OrmTokenDto | null> {
    const foundToken = await this.model.findOne(dto).exec();

    return foundToken || null;
  }

  async create(entity: OrmTokenDto): Promise<void> {
    const tokenAlreadyExists = await this.findOne({
      userId: entity.userId,
      type: entity.type,
    });

    if (tokenAlreadyExists) {
      await this.update(entity);
    } else {
      await this.model.create(entity);
    }
  }

  async update(entity: OrmTokenDto): Promise<void> {
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
