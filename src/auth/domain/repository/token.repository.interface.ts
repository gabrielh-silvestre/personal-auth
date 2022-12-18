import type { IRepository } from '@shared/domain/repository/repository.interface';

import { Token } from '../entity/Token';
import { TokenType } from '../entity/token.interface';

export interface ITokenRepository extends Omit<IRepository<Token>, 'findAll'> {
  findByUserIdAndType(userId: string, type: TokenType): Promise<Token | null>;
}
