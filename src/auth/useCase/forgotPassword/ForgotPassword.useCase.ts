import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type { IMailService } from '@auth/infra/service/mail/mail.service.interface';
import type { InputForgotPasswordDto } from './ForgotPassword.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    @Inject('USER_SERVICE') private readonly userService: IUserService,
    @Inject('MAIL_SERVICE') private readonly mailService: IMailService,
  ) {}

  private async sendRecoverPasswordEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    this.mailService.recoverPasswordMail({ email, username, token });
  }

  async execute({ email }: InputForgotPasswordDto): Promise<void | never> {
    const user = await this.userService.findByEmail(email);
    const token = await this.tokenService.generateRecoverPasswordToken(user.id);

    this.sendRecoverPasswordEmail(email, user.username, token);
  }
}
