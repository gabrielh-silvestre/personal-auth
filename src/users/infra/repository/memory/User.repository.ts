import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/entity/User';

import { IUserRepository } from 'src/users/domain/repository/user.repository.interface';

@Injectable()
export class UserInMemoryRepository implements IUserRepository {
  private static USERS: User[] = [];

  async create(entity: User): Promise<void> {
    UserInMemoryRepository.USERS.push(entity);
  }

  async update(entity: User): Promise<void> {
    const foundUSerIndex = UserInMemoryRepository.USERS.findIndex(
      (user) => user.id === entity.id,
    );

    UserInMemoryRepository.USERS[foundUSerIndex] = entity;
  }

  async find(id: string): Promise<User | null> {
    const foundUser = UserInMemoryRepository.USERS.find(
      (user) => user.id === id,
    );

    return foundUser || null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const foundUser = UserInMemoryRepository.USERS.find(
      (user) => user.email === email,
    );

    return !!foundUser;
  }

  static reset(users: User[]): void {
    UserInMemoryRepository.USERS.length = 0;
    UserInMemoryRepository.USERS.push(...users);
  }
}
