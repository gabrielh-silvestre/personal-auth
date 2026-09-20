import type { TokenType } from '#auth/domain/entity/token.interface';

import { Token } from '#auth/domain/entity/Token';

export interface ITokenRepository {
  create(entity: Token): Promise<void>;
  update(entity: Token): Promise<void>;
  find(id: string): Promise<Token | null>;
  findByUserIdAndType(userId: string, type: TokenType): Promise<Token | null>;
}
