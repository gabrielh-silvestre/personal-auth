import type { IMail } from './mail.interface';

import { MailValidatorFactory } from '../factory/Mail.validator.factory';

export class Mail implements IMail {
  private _id: string;
  private _from: string;
  private _to: string;
  private _cc: string[];
  private _subject: string;
  private _text: string;
  private _html: string;

  constructor(
    id: string,
    from: string,
    to: string,
    cc: string[],
    subject: string,
    text: string,
    html: string,
  ) {
    this._id = id;
    this._from = from;
    this._to = to;
    this._cc = cc;
    this._subject = subject;
    this._text = text;
    this._html = html;

    this.validate();
  }

  private validate(): void | never {
    MailValidatorFactory.create().validate(this);
  }

  get id(): string {
    return this._id;
  }

  get from(): string {
    return this._from;
  }

  get to(): string {
    return this._to;
  }

  get cc(): string[] {
    return this._cc;
  }

  get subject(): string {
    return this._subject;
  }

  get text(): string {
    return this._text;
  }

  get html(): string {
    return this._html;
  }
}
