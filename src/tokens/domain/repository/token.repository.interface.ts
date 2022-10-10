import type { IRepository } from '@shared/domain/repository/repository.interface';

import { Token } from '../entity/Token';

export interface ITokenRepository extends Omit<IRepository<Token>, 'findAll'> {
  findByUserId(userId: string): Promise<Token | null>;
}
