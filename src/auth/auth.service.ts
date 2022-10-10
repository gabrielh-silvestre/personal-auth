import { Injectable } from '@nestjs/common';

import type { InputValidateUserDto } from './dto/ValidateUser.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { UserService } from '@users/user.service';
import { TokenService } from '@tokens/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser({
    email,
    password,
  }: InputValidateUserDto): Promise<void | never> {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password.isEqual(password)) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }
  }

  async validateToken(token: string): Promise<void | never> {
    try {
      const response = await this.tokenService.validateToken(token);

      if (!response) {
        throw ExceptionFactory.unauthorized('Invalid token');
      }
    } catch (err) {
      throw ExceptionFactory.unauthorized(err.message);
    }
  }
}
