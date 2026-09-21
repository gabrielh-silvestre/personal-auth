import type { IToken } from '#auth/domain/entity/token.interface';

import { Token } from '#auth/domain/entity/Token';

export interface IDatabaseAdapter {
  findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null>;
  create(entity: Token): Promise<void>;
  update(entity: Token): Promise<void>;
}
