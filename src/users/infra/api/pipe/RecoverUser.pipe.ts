import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

export type InputRecoverUser = {
  email: string;
  password: string;
}

export type OutputRecoverUser = {
  id: string;
  username: string;
}

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { GetUserByEmailUseCase } from '@users/useCase/getByEmail/GetUserByEmail.useCase';

@Injectable()
export class RecoverUserPipe
  implements PipeTransform<InputRecoverUser, Promise<OutputRecoverUser>>
{
  constructor(private readonly getUserById: GetUserByEmailUseCase) {}

  async transform(
    value: InputRecoverUser,
    _metadata: ArgumentMetadata,
  ): Promise<OutputRecoverUser> {
    const foundUser = await this.getUserById.execute(value.email);

    if (!foundUser || !foundUser.password.isEqual(value.password)) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return {
      id: foundUser.id,
      username: foundUser.username,
    };
  }
}
