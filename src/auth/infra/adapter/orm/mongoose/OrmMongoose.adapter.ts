import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmTokenDto } from '../orm.interface';

import { TOKEN_SCHEMA } from '@auth/utils/constants';

@Injectable()
export class OrmMongooseAdapter implements IOrmAdapter<OrmTokenDto> {
  constructor(
    @InjectModel(TOKEN_SCHEMA)
    private readonly model: Model<OrmTokenDto & Document>,
  ) {}

  async findAll(): Promise<OrmTokenDto[]> {
    const foundTokens = await this.model.find().exec();

    return foundTokens;
  }

  async findOne<T extends Partial<OrmTokenDto>>(
    dto: T,
  ): Promise<OrmTokenDto | null> {
    const foundToken = await this.model.findOne(dto).exec();

    return foundToken || null;
  }

  async create(dto: OrmTokenDto): Promise<void> {
    await this.model.create(dto);
  }

  async update(id: string, dto: OrmTokenDto): Promise<void> {
    await this.model.findOneAndUpdate({ id }, dto).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id }).exec();
  }
}
