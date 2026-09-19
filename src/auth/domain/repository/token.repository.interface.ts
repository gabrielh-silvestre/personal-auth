import type { IRepository } from '@shared/domain/repository/repository.interface.js';

import type { TokenType } from '../entity/token.interface.js';

import { Token } from '../entity/Token.js';

export interface ITokenRepository extends Omit<IRepository<Token>, 'findAll'> {
  findByUserIdAndType(userId: string, type: TokenType): Promise<Token | null>;
}
