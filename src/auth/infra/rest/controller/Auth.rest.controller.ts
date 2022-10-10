import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import type { OutputCreateTokenDto } from '@tokens/dto/CreateToken.dto';
import type { OutputRecoversUserDto } from '@auth/dto/RecoverUser.dto';

import { TokenService } from '@tokens/token.service';

import { ValidateUserGuard } from '../guard/ValidateUser.guard';
import { RecoverUserByEmailPipe } from '../pipe/RecoverUserByEmail.pipe';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login(
    @Body(RecoverUserByEmailPipe) { id }: OutputRecoversUserDto,
  ): Promise<OutputCreateTokenDto> {
    return this.tokenService.createToken({
      userId: id,
    });
  }
}
