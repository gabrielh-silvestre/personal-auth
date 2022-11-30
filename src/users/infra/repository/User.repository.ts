import { Inject } from '@nestjs/common';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { IUserDatabaseAdapter } from '../adapter/database/UserDatabase.adapter.interface';

import { User } from '@users/domain/entity/User';

import { USER_DATABASE_ADAPTER } from '@users/utils/constants';

export class UserRepository implements IUserRepository {
  constructor(
    @Inject(USER_DATABASE_ADAPTER)
    private readonly userDatabaseAdapter: IUserDatabaseAdapter,
  ) {}

  async find(id: string): Promise<User> {
    const foundUser = await this.userDatabaseAdapter.getById(id);

    return foundUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const foundUser = await this.userDatabaseAdapter.getByEmail(email);

    return foundUser;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const foundUser = await this.userDatabaseAdapter.getByEmail(email);

    return !!foundUser;
  }

  async create(entity: User): Promise<void> {
    this.userDatabaseAdapter.create(entity);
  }

  async update(entity: User): Promise<void> {
    this.userDatabaseAdapter.update(entity);
  }
}
