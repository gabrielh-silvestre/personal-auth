import { IsUUID, IsNotEmpty, IsEmail, validateSync } from 'class-validator';

import type { IValidator } from '@shared/domain/validator/validator.interface';
import type { IMail } from '../entity/mail.interface';

export class MailClassValidator implements IValidator<IMail> {
  @IsUUID(4, { message: 'Id must be a valid UUID v4' })
  private readonly id: string;

  private readonly from: string;

  @IsEmail({}, { message: 'Recipient must have a valid email address' })
  private readonly to: string;

  @IsEmail(
    {},
    {
      each: true,
      message: 'All Cc recipients must have a valid email address',
    },
  )
  private readonly cc: string[];

  @IsNotEmpty({ message: 'Subject is required' })
  private readonly subject: string;

  @IsNotEmpty({ message: 'Text is required' })
  private readonly text: string;

  @IsNotEmpty({ message: 'Html is required' })
  private readonly html: string;

  private constructor(
    id: string,
    from: string,
    to: string,
    cc: string[],
    subject: string,
    text: string,
    html: string,
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.subject = subject;
    this.text = text;
    this.html = html;
  }

  static init(): MailClassValidator {
    return new MailClassValidator('', '', '', [], '', '', '');
  }

  validate(entity: IMail): void {
    const { id, from, to, cc, subject, text, html } = entity;

    const mailValidation = new MailClassValidator(
      id,
      from,
      to,
      cc,
      subject,
      text,
      html,
    );

    const [error] = validateSync(mailValidation, { stopAtFirstError: true });

    if (error) {
      const constraint = Object.values(error.constraints)[0];
      throw new Error(constraint);
    }
  }
}
