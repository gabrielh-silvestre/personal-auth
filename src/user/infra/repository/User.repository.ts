import { Inject, Injectable } from '@nestjs/common';

import type { IUser } from '@user/domain/entity/user.interface';
import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';

import { User } from '@user/domain/entity/User';
import { UserFactory } from '@user/domain/factory/User.factory';

import { ORM_ADAPTER } from '@auth/utils/constants';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @Inject(ORM_ADAPTER)
    private readonly ormAdapter: IOrmAdapter<IUser>,
  ) {}

  async find(id: string): Promise<User> {
    const foundUser = await this.ormAdapter.findOne({ id });
    return foundUser ? UserFactory.createFromPersistence(foundUser) : null;
  }

  async findByEmail(email: string): Promise<User> {
    const foundUser = await this.ormAdapter.findOne({ email });
    return foundUser ? UserFactory.createFromPersistence(foundUser) : null;
  }

  async create({ id, email, password }: User): Promise<void> {
    await this.ormAdapter.create({ id, email, password });
  }

  async update(entity: User): Promise<void> {
    await this.ormAdapter.update(entity.id, {
      id: entity.id,
      email: entity.email,
      password: entity.password,
    });
  }
}
