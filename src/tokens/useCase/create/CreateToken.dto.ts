import { TokenType } from '@tokens/domain/entity/token.interface';

export interface CreateTokenPayload {
  userId: string;
  tokenId: string;
}

export type TokenTypeDto = keyof typeof TokenType;
