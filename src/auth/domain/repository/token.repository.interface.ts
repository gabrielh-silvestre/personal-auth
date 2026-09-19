import type { TokenType } from '../entity/token.interface.js';

import { Token } from '../entity/Token.js';

export interface ITokenRepository {
  create(entity: Token): Promise<void>;
  update(entity: Token): Promise<void>;
  find(id: string): Promise<Token | null>;
  findByUserIdAndType(userId: string, type: TokenType): Promise<Token | null>;
}
