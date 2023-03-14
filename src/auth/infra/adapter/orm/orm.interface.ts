import type { TokenType } from '@auth/domain/entity/token.interface';

export interface OrmTokenDto {
  id: string;
  userId: string;
  expireTime: number;
  lastRefresh: Date;
  expires: Date;
  revoked: boolean;
  type: TokenType;
}
