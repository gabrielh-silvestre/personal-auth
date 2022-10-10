import type { Request as IRequest } from 'express';
import { Controller, Post, Request, UseGuards } from '@nestjs/common';

import { TokenService } from '@tokens/token.service';
import { ValidateUserGuard } from '../guard/ValidateUser.guard';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login(@Request() req: IRequest) {
    return this.tokenService.createToken({
      userId: req.user.id,
    });
  }
}
