import { AuthService } from '@auth/auth.service';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ValidateUserGuard } from '../guard/ValidateUser.guard';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login(@Req() req: Request) {
    console.log({ req });

    return { message: 'Login successful' };
  }
}
