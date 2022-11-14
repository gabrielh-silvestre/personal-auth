import { Injectable } from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from '@users/useCase/create/CreateUser.dto';
import type { OutputGetUserDto } from '@users/useCase/getByEmail/GetUserByEmail.dto';

import { CreateUserUseCase } from '@users/useCase/create/CreateUser.useCase';
import { GetUserByEmailUseCase } from '@users/useCase/getByEmail/GetUserByEmail.useCase';
import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

@Injectable()
export class UserFacade {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByEmail: GetUserByEmailUseCase,
    private readonly getUserById: GetUserByIdUseCase,
  ) {}

  async create(dto: InputCreateUserDto): Promise<OutputCreateUserDto> {
    return this.createUserUseCase.execute(dto);
  }

  async getByEmail(email: string): Promise<OutputGetUserDto> {
    return this.getUserByEmail.execute(email);
  }

  async getById(id: string): Promise<OutputGetUserDto> {
    return this.getUserById.execute(id);
  }
}
