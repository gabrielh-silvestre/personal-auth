import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import type { InputForgotPasswordDto } from '@auth/useCase/forgotPassword/ForgotPassword.dto';

import { ForgotPasswordUseCase } from '@auth/useCase/forgotPassword/ForgotPassword.useCase';

import { ValidateUserRegisterGuard } from '../../guard/ValidateUserRegister.guard';

@Controller('/auth')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {}

  private async handle(data: InputForgotPasswordDto): Promise<void | never> {
    this.forgotPasswordUseCase.execute(data);
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
