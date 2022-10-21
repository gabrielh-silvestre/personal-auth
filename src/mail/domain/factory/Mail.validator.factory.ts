import type { IValidator } from '@shared/domain/validator/validator.interface';
import type { IMail } from '../entity/mail.interface';

import { MailClassValidator } from '../validator/mail.class.validator';

export class MailValidatorFactory {
  public static create(): IValidator<IMail> {
    return MailClassValidator.init();
  }
}
