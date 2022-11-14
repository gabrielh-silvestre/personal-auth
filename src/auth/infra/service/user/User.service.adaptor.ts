import { Injectable } from '@nestjs/common';

import type { IUserService, OutputUser } from './user.service.interface';

import { UserFacade } from '@users/infra/facade/User.facade';

@Injectable()
export class UserServiceAdaptor implements IUserService {
  constructor(private readonly userFacade: UserFacade) {}

  async findById(id: string): Promise<OutputUser | never> {
    return this.userFacade.getById(id);
  }

  async findByEmail(email: string): Promise<OutputUser | never> {
    return this.userFacade.getByEmail(email);
  }
}
