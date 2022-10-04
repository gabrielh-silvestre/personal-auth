import type { IRepository } from 'src/domain/shared/repository/repository.interface';

import { User } from '../entity/User';

export interface IUserRepository extends IRepository<User> {
  existsByEmail(email: string): Promise<boolean>;
}
