import { Body, Injectable, UseGuards } from '@nestjs/common';

import type { OutputRecoverUserDto } from '@users/dto/RecoverUser.dto';

import { TokenService } from '@tokens/token.service';
import { ValidateUserGuard } from '@auth/infra/rest/guard/ValidateUser.guard';
import { RecoverUserPipe } from './infra/rest/pipe/RecoverUser.pipe';

@Injectable()
export class LoginService {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(ValidateUserGuard)
  async login(
    @Body(RecoverUserPipe) { id }: OutputRecoverUserDto,
  ): Promise<string> {
    const { token } = await this.tokenService.createToken({ userId: id });

    return token;
  }
}
