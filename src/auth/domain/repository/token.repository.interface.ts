import type { IRepository } from '@shared/domain/repository/repository.interface';

import type { TokenType } from '../entity/token.interface';

import { Token } from '../entity/Token';

export interface ITokenRepository extends Omit<IRepository<Token>, 'findAll'> {
  findByUserIdAndType(userId: string, type: TokenType): Promise<Token | null>;
  deleteByUserIdAndType(userId: string, type: TokenType): Promise<void>;
}
