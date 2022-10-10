import type { IPassword } from '../value-object/Password/password.interface';

import { Password } from '../value-object/Password';

export class PasswordFactory {
  public static createNew(password: string): IPassword {
    return new Password(password, true);
  }

  public static createFromHash(password: string): IPassword {
    return new Password(password);
  }
}
