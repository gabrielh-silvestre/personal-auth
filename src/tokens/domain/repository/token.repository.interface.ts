import type { IRepository } from '@shared/domain/repository/repository.interface';

import { Token } from '../entity/Token';

export type ITokenRepository = Omit<IRepository<Token>, 'findAll'>;
