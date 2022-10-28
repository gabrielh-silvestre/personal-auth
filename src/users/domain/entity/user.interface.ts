import { IPassword } from '../value-object/Password/password.interface';

export interface IUser {
  get id(): string;
  get username(): string;
  get email(): string;
  get password(): IPassword;
  get updatedAt(): Date;
  get createdAt(): Date;
}
