import type { IException } from './exception.interface';

export class Exception extends Error implements IException {
  private _code: number;
  private _status: number;

  constructor(message: string, code: number, status: number) {
    super(message);

    this._code = code;
    this._status = status;
  }

  get code(): number {
    return this._code;
  }

  get status(): number {
    return this._status;
  }
}
