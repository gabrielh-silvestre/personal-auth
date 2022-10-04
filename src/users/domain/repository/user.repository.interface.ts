import type { IRepository } from 'src/shared/repository/repository.interface';

import { User } from '../entity/User';

export interface IUserRepository extends Omit<IRepository<User>, 'findAll'> {
  existsByEmail(email: string): Promise<boolean>;
}
