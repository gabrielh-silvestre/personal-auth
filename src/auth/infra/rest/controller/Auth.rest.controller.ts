import { Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';
import { ValidateUserGuard } from '../guard/ValidateUser.guard';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login() {
    return { message: 'Login successful' };
  }
}
