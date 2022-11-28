import { Inject } from '@nestjs/common';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { IUserDatabaseGateway } from '../gateway/database/UserDatabase.gateway.interface';

import { User } from '@users/domain/entity/User';

export class UserRepository implements IUserRepository {
  constructor(
    @Inject('USER_DATABASE')
    private readonly userDatabaseGateway: IUserDatabaseGateway,
  ) {}

  async find(id: string): Promise<User> {
    const foundUser = await this.userDatabaseGateway.getById(id);

    return foundUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const foundUser = await this.userDatabaseGateway.getByEmail(email);

    return foundUser;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const foundUser = await this.userDatabaseGateway.getByEmail(email);

    return !!foundUser;
  }

  async create(entity: User): Promise<void> {
    this.userDatabaseGateway.create(entity);
  }

  async update(entity: User): Promise<void> {
    this.userDatabaseGateway.update(entity);
  }
}
