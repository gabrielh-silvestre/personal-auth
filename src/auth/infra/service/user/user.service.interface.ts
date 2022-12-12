export type OutputUser = any;

export interface IUserService {
  findById(id: string): Promise<OutputUser | never>;
  findByEmail(email: string): Promise<OutputUser | never>;
}
