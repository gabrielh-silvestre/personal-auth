import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import type {
  InputRecoversUserDto,
  OutputRecoversUserDto,
} from '@auth/dto/RecoverUser.dto';

import { UserService } from '@users/user.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RecoverUserByEmailPipe
  implements
    PipeTransform<InputRecoversUserDto, Promise<OutputRecoversUserDto>>
{
  constructor(private readonly userService: UserService) {}

  async transform(
    value: InputRecoversUserDto,
    metadata: ArgumentMetadata,
  ): Promise<OutputRecoversUserDto> {
    const foundUser = await this.userService.findByEmail(value.email);

    if (!foundUser || !foundUser.password.isEqual(value.password)) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return {
      id: foundUser.id,
      username: foundUser.username,
    };
  }
}
