import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

import { User } from '@users/domain/entity/User';
import { UserFactory } from '@users/domain/factory/User.factory';

import type { IUserDatabaseAdapter } from '../UserDatabase.adapter.interface';

@Injectable()
export class UserDatabasePrismaAdapter implements IUserDatabaseAdapter {
  private readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  private convertToUser(foundUser: PrismaUser): User {
    return UserFactory.createFromPersistence(
      foundUser.id,
      foundUser.username,
      foundUser.email,
      foundUser.createdAt,
      foundUser.updatedAt,
      foundUser.password,
    );
  }

  async getAll(): Promise<User[]> {
    const foundUsers = await this.client.user.findMany();
    return foundUsers.map(this.convertToUser);
  }

  async getById(id: string): Promise<User> {
    const foundUser = await this.client.user.findUnique({
      where: { id },
    });

    return foundUser ? this.convertToUser(foundUser) : null;
  }

  async getByEmail(email: string): Promise<User> {
    const foundUser = await this.client.user.findUnique({
      where: { email },
    });

    return foundUser ? this.convertToUser(foundUser) : null;
  }

  async create(user: User): Promise<void> {
    await this.client.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password.toString(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async update(user: User): Promise<void> {
    await this.client.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        email: user.email,
        password: user.password.toString(),
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.user.delete({
      where: { id },
    });
  }
}
