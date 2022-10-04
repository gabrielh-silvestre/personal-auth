import type { IValidator } from 'src/domain/shared/validator/validator.interface';
import type { IUser } from '../entity/user.interface';

import { UserClassValidator } from '../validator/user.class.validator';

export class UserValidatorFactory {
  public static create(): IValidator<IUser> {
    return UserClassValidator.init();
  }
}
