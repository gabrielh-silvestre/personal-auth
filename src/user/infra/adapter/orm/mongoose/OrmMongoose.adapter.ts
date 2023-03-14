import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmUserDto } from '../orm.interface';

@Injectable()
export class OrmMongooseAdapter implements IOrmAdapter<OrmUserDto> {
  constructor(
    @InjectModel('USER_SCHEMA')
    private readonly model: Model<OrmUserDto & Document>,
  ) {}

  async findAll(): Promise<OrmUserDto[]> {
    const foundUsers = await this.model.find().exec();

    return foundUsers;
  }

  async findOne<K extends Partial<OrmUserDto>>(dto: K): Promise<OrmUserDto> {
    const foundUser = await this.model.findOne(dto).exec();

    return foundUser;
  }

  async create(data: OrmUserDto): Promise<void> {
    await this.model.create(data);
  }

  async update(id: string, data: OrmUserDto): Promise<void> {
    await this.model.findOneAndUpdate({ id }, data).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id }).exec();
  }
}
