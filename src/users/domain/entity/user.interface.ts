export interface IUser {
  get id(): string;
  get username(): string;
  get email(): string;
  get updatedAt(): Date;
  get createdAt(): Date;
}
