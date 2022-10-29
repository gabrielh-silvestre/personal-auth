import { User } from '@users/domain/entity/User';

export type OutputUser = User;

export interface IUserService {
  findById(id: string): Promise<OutputUser | never>;
  findByEmail(email: string): Promise<OutputUser | never>;
}
