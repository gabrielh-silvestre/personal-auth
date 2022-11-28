import { Injectable } from '@nestjs/common';

import { User } from '@users/domain/entity/User';

import type { IUserDatabaseGateway } from '../UserDatabase.gateway.interface';

@Injectable()
export class UserMemoryGateway implements IUserDatabaseGateway {
  private static readonly USERS: User[] = [];

  async getAll(): Promise<User[]> {
    return UserMemoryGateway.USERS;
  }

  async getById(id: string): Promise<User | null> {
    return UserMemoryGateway.USERS.find((user) => user.id === id) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    return UserMemoryGateway.USERS.find((user) => user.email === email) || null;
  }

  async create(user: User): Promise<void> {
    UserMemoryGateway.USERS.push(user);
  }

  async update(user: User): Promise<void> {
    const foundUserIndex = UserMemoryGateway.USERS.findIndex(
      (user) => user.id === user.id,
    );

    UserMemoryGateway.USERS[foundUserIndex] = user;
  }

  async delete(id: string): Promise<void> {
    const foundUserIndex = UserMemoryGateway.USERS.findIndex(
      (user) => user.id === id,
    );

    UserMemoryGateway.USERS.splice(foundUserIndex, 1);
  }

  static reset(users: User[]): void {
    UserMemoryGateway.USERS.length = 0;
    UserMemoryGateway.USERS.push(...users);
  }
}
