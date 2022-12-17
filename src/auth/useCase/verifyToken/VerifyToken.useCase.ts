import { Inject, Injectable } from '@nestjs/common';

import type {
  InputVerifyTokenDto,
  OutputVerifyTokenDto,
} from './VerifyToken.dto';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class VerifyTokenUseCase {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute({
    tokenId,
  }: InputVerifyTokenDto): Promise<OutputVerifyTokenDto | never> {
    const { userId } = await this.tokenGateway.verifyToken(tokenId);

    return { userId };
  }
}
