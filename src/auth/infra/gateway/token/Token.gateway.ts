import { Inject, Injectable } from '@nestjs/common';

import type { ITokenAdapter } from '@auth/infra/adapter/token/Token.adapter.interface';
import type { ITokenGateway, TokenPayload } from './token.gateway.interface';

import { TOKEN_ADAPTER } from '@auth/utils/constants';

@Injectable()
export class TokenGateway implements ITokenGateway {
  constructor(
    @Inject(TOKEN_ADAPTER) private readonly tokenAdapter: ITokenAdapter,
  ) {}

  generateAccessToken(userId: string): Promise<string> {
    return this.tokenAdapter.generate(userId, 'ACCESS');
  }

  generateRecoverPasswordToken(userId: string): Promise<string> {
    return this.tokenAdapter.generate(userId, 'RECOVER_PASSWORD');
  }

  generateRefreshToken(userId: string): Promise<string> {
    return this.tokenAdapter.generate(userId, 'REFRESH');
  }

  verifyToken(token: string): Promise<TokenPayload> {
    return this.tokenAdapter.verify(token);
  }
}
