import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import type { OutputCreateTokenDto } from '@tokens/dto/CreateToken.dto';
import type { OutputRecoverUserDto } from '@auth/dto/RecoverUser.dto';

import { TokenService } from '@tokens/token.service';

import { ValidateUserGuard } from '../guard/ValidateUser.guard';
import { RecoverUserPipe } from '../../../../users/infra/rest/pipe/RecoverUser.pipe';

@Controller('/auth')
export class AuthRestController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  async login(
    @Body(RecoverUserPipe) { id }: OutputRecoverUserDto,
  ): Promise<OutputCreateTokenDto> {
    return this.tokenService.createToken({
      userId: id,
    });
  }
}
