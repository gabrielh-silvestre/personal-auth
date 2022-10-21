import { Inject, Injectable } from "@nestjs/common";

import type { IUserRepository } from "@users/domain/repository/user.repository.interface";
import type { OutputGetUserDto } from "../getByEmail/GetUserByEmail.dto";

import { ExceptionFactory } from "@exceptions/factory/Exception.factory";

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<OutputGetUserDto | never> {
    const foundUser = await this.userRepository.find(id);

    if (!foundUser) {
      throw ExceptionFactory.notFound('User not found');
    }

    return foundUser;
  }
}
