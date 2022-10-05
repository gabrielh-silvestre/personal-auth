import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { IUserRepository } from 'src/users/domain/repository/user.repository.interface';

import { User } from 'src/users/domain/entity/User';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  private readonly prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const foundUser = await this.prismaClient.user.findUnique({
      where: { email },
    });

    return !!foundUser;
  }

  async create(entity: User): Promise<void> {
    await this.prismaClient.user.create({
      data: {
        id: entity.id,
        username: entity.username,
        email: entity.email,
        password: entity.password.toString(),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
  }

  async update(entity: User): Promise<void> {
    await this.prismaClient.user.update({
      where: { id: entity.id },
      data: {
        id: entity.id,
        username: entity.username,
        email: entity.email,
        password: entity.password.toString(),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
  }

  async find(id: string): Promise<User | null> {
    const foundUser = await this.prismaClient.user.findUnique({
      where: { id },
    });

    return foundUser
      ? new User(foundUser.id, foundUser.username, foundUser.email)
      : null;
  }
}
