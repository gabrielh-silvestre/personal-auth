import { Injectable } from '@nestjs/common';

import { User } from '@users/domain/entity/User';

import type { IUserDatabaseAdapter } from '../UserDatabase.adapter.interface';

@Injectable()
export class UserDatabaseMemoryAdapter implements IUserDatabaseAdapter {
  private static readonly USERS: User[] = [];

  async getAll(): Promise<User[]> {
    return UserDatabaseMemoryAdapter.USERS;
  }

  async getById(id: string): Promise<User | null> {
    return (
      UserDatabaseMemoryAdapter.USERS.find((user) => user.id === id) || null
    );
  }

  async getByEmail(email: string): Promise<User | null> {
    return (
      UserDatabaseMemoryAdapter.USERS.find((user) => user.email === email) ||
      null
    );
  }

  async create(user: User): Promise<void> {
    UserDatabaseMemoryAdapter.USERS.push(user);
  }

  async update(user: User): Promise<void> {
    const foundUserIndex = UserDatabaseMemoryAdapter.USERS.findIndex(
      (user) => user.id === user.id,
    );

    UserDatabaseMemoryAdapter.USERS[foundUserIndex] = user;
  }

  async delete(id: string): Promise<void> {
    const foundUserIndex = UserDatabaseMemoryAdapter.USERS.findIndex(
      (user) => user.id === id,
    );

    UserDatabaseMemoryAdapter.USERS.splice(foundUserIndex, 1);
  }

  static reset(users: User[]): void {
    UserDatabaseMemoryAdapter.USERS.length = 0;
    UserDatabaseMemoryAdapter.USERS.push(...users);
  }
}
