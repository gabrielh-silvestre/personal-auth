import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { InputForgotPasswordDto } from '@auth/useCase/forgotPassword/ForgotPassword.dto';
import type { IMailService } from '@auth/infra/service/mail/mail.service.interface';

import { ForgotPasswordUseCase } from '@auth/useCase/forgotPassword/ForgotPassword.useCase';

import { ValidateUserRegisterGuard } from '../../guard/ValidateUserRegister.guard';

@Controller('/auth')
export class ForgotPasswordController {
  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly accessTokenService: JwtService,
    @Inject('MAIL_SERVICE')
    private readonly mailService: IMailService,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
  ) {}

  private async handle(data: InputForgotPasswordDto): Promise<void | never> {
    const token = await this.forgotPasswordUseCase.execute(data);
    const jwtToken = await this.accessTokenService.signAsync(token);

    await this.mailService.recoverPasswordMail({
      email: data.email,
      token: jwtToken,
      username: '',
    });
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ValidateUserRegisterGuard)
  async handleRest(
    @Body() data: InputForgotPasswordDto,
  ): Promise<void | never> {
    return this.handle(data);
  }
}
