import { Body, Controller, Post } from '@nestjs/common';

import type {
  InputCreateTokenDto,
  OutputCreateTokenDto,
} from '@tokens/dto/CreateToken.dto';

import { TokenService } from '@tokens/token.service';

@Controller('/auth')
export class TokenRestController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('/login')
  async login(
    @Body() data: InputCreateTokenDto,
  ): Promise<OutputCreateTokenDto> {
    return this.tokenService.createToken(data);
  }
}
