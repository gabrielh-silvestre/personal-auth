import type { IRepository } from '@shared/domain/repository/repository.interface';

import { User } from '../entity/User';

export interface IUserRepository extends Omit<IRepository<User>, 'findAll'> {
  existsByEmail(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<User | null>;
}
