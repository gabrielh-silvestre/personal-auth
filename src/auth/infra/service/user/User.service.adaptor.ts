import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import type { IUserService, OutputUser } from './user.service.interface';

@Injectable()
export class UserServiceAdaptor implements IUserService {
  constructor(@Inject('USER') private readonly client: ClientProxy) {}

  async findById(_id: string): Promise<OutputUser | never> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(_email: string): Promise<OutputUser | never> {
    throw new Error('Method not implemented.');
  }

  verifyCredentials(
    email: string,
    password: string,
  ): Observable<OutputUser | never> {
    return this.client.send('verify_user_credentials', {
      email,
      password,
    });
  }
}
