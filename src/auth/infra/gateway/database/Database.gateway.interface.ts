import type { TokenType } from '@auth/domain/entity/token.interface';
import type { ITokenRepository } from '@auth/domain/repository/token.repository.interface';

export interface OrmTokenDto {
  id: string;
  userId: string;
  expireTime: number;
  lastRefresh: Date;
  expires: Date;
  revoked: boolean;
  type: TokenType;
}

export type IDatabaseGateway = ITokenRepository;
