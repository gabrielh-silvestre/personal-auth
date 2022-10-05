import {
  IsUUID,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  validateSync,
} from 'class-validator';

import type { IValidator } from 'src/shared/domain/validator/validator.interface';
import type { IUser } from '../entity/user.interface';

export class UserClassValidator implements IValidator<IUser> {
  @IsUUID(4, { message: 'Id must be a valid UUID v4' })
  private readonly id: string;

  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(8, { message: 'Username must be at most 8 characters long' })
  @IsNotEmpty({ message: 'Username is required' })
  private readonly username: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  private readonly email: string;

  private constructor(id: string, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
  }

  static init(): UserClassValidator {
    return new UserClassValidator('', '', '');
  }

  validate(entity: IUser): void | never {
    const { id, username, email } = entity;

    const userValidation = new UserClassValidator(id, username, email);

    const [error] = validateSync(userValidation, { stopAtFirstError: true });

    if (error) {
      const constraint = Object.values(error.constraints)[0];
      throw new Error(constraint);
    }
  }
}
