import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import type {
  InputRecoverUserDto,
  OutputRecoverUserDto,
} from '@users/dto/RecoverUser.dto';

import { UserService } from '@users/user.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RecoverUserPipe
  implements PipeTransform<InputRecoverUserDto, Promise<OutputRecoverUserDto>>
{
  constructor(private readonly userService: UserService) {}

  async transform(
    value: InputRecoverUserDto,
    _metadata: ArgumentMetadata,
  ): Promise<OutputRecoverUserDto> {
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
