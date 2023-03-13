import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import type { IOrmAdapter } from '../Orm.adapter.interface';

import { TOKEN_SCHEMA } from '@auth/utils/constants';

@Injectable()
export class OrmMongooseAdapter<T> implements IOrmAdapter<T> {
  constructor(
    @InjectModel(TOKEN_SCHEMA)
    private readonly model: Model<T & Document>,
  ) {}

  async findAll(): Promise<T[]> {
    const foundTokens = await this.model.find().exec();

    return foundTokens;
  }

  async findOne<K extends Partial<T>>(dto: K): Promise<T | null> {
    const foundToken = await this.model.findOne(dto).exec();

    return foundToken || null;
  }

  async create(dto: T): Promise<void> {
    await this.model.create(dto);
  }

  async update(id: string, dto: T): Promise<void> {
    await this.model.findOneAndUpdate({ id }, dto).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id }).exec();
  }
}
