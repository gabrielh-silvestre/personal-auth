import {
  IsUUID,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  validateSync,
  IsDate,
} from 'class-validator';

import type { IValidator } from '@shared/domain/validator/validator.interface';
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

  @IsDate({ message: 'CreatedAt must be a valid date' })
  private readonly createdAt: Date;

  @IsDate({ message: 'UpdatedAt must be a valid date' })
  private readonly updatedAt: Date;

  private constructor(
    id: string,
    username: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static init(): UserClassValidator {
    return new UserClassValidator('', '', '', new Date(), new Date());
  }

  validate(entity: IUser): void | never {
    const { id, username, email, createdAt, updatedAt } = entity;

    const userValidation = new UserClassValidator(
      id,
      username,
      email,
      createdAt,
      updatedAt,
    );

    const [error] = validateSync(userValidation, { stopAtFirstError: true });

    if (error) {
      const constraint = Object.values(error.constraints)[0];
      throw new Error(constraint);
    }
  }
}
