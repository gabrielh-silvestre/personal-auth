import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { InputRefreshDto, OutputRefreshDto } from './Refresh.dto';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
  ) {}

  async execute({
    userId,
  }: InputRefreshDto): Promise<OutputRefreshDto | never> {
    const tokenId = await this.tokenService.generateRefreshToken(userId);

    return { tokenId, userId };
  }
}
