import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type {
  InputForgotPasswordDto,
  OutputForgotPasswordDto,
} from './ForgotPassword.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  async execute({
    email,
  }: InputForgotPasswordDto): Promise<OutputForgotPasswordDto | never> {
    const { id: userId } = await this.userService.findByEmail(email);
    const tokenId = await this.tokenService.generateRecoverPasswordToken(
      userId,
    );

    return { tokenId, userId };
  }
}
