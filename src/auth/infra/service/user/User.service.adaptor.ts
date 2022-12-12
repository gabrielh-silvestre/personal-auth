import { Injectable } from '@nestjs/common';

import type { IUserService, OutputUser } from './user.service.interface';

@Injectable()
export class UserServiceAdaptor implements IUserService {
  async findById(_id: string): Promise<OutputUser | never> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(_email: string): Promise<OutputUser | never> {
    throw new Error('Method not implemented.');
  }
}
