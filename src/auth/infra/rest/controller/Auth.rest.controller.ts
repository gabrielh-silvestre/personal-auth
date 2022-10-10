import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import type { OutputCreateTokenDto } from '@tokens/dto/CreateToken.dto';
import type { InputLoginDto } from '@auth/dto/Login.dto';

import { TokenService } from '@tokens/token.service';
import { ValidateUserGuard } from '../guard/ValidateUser.guard';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login(@Body() { user }: InputLoginDto): Promise<OutputCreateTokenDto> {
    return this.tokenService.createToken({
      userId: user.id,
    });
  }
}
