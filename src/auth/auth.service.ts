import { Injectable } from '@nestjs/common';

import type {
  InputValidateUserDto,
  OutputValidateUserDto,
} from './dto/ValidateUser.dto';

import { UserService } from '@users/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser({
    email,
    password,
  }: InputValidateUserDto): Promise<OutputValidateUserDto | null> {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password.isEqual(password)) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  }
}
