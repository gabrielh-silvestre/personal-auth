import { Injectable } from '@nestjs/common';

import type { IUserService, OutputUser } from './user.service.interface';

import { GetUserByEmailUseCase } from '@users/useCase/getByEmail/GetUserByEmail.useCase';
import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

@Injectable()
export class UserServiceAdaptor implements IUserService {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
  ) {}

  async findById(id: string): Promise<OutputUser | never> {
    return await this.getUserByIdUseCase.execute(id);
  }

  async findByEmail(email: string): Promise<OutputUser | never> {
    return this.getUserByEmailUseCase.execute(email);
  }
}
