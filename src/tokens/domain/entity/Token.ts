import { IToken, TokenType } from './token.interface';

export class Token implements IToken {
  private _id: string;
  private _userId: string;
  private _expireTime: number;
  private _lastRefresh: Date;
  private _expires: Date;
  private _revoked: boolean;
  private _type: TokenType;

  constructor(
    id: string,
    userId: string,
    expireTime: number,
    lastRefresh: Date,
    revoked: boolean,
    type: TokenType,
  ) {
    this._id = id;
    this._userId = userId;
    this._expireTime = expireTime;
    this._lastRefresh = lastRefresh;
    this._expires = new Date(lastRefresh.getTime() + expireTime);
    this._revoked = revoked;
    this._type = type;
  }

  isValid(): boolean {
    return !this._revoked && this._expires > new Date();
  }

  refresh(): void {
    if (this._type !== TokenType.REFRESH) {
      throw new Error('Only refresh tokens can be refreshed');
    }

    this._lastRefresh = new Date();
    this._expires = new Date(this._lastRefresh.getTime() + this._expireTime);
  }

  revoke(): void {
    this._revoked = true;
  }

  expiresIn(): number {
    return this._expires.getTime() - new Date().getTime();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get expireTime(): number {
    return this._expireTime;
  }

  get lastRefresh(): Date {
    return this._lastRefresh;
  }

  get expires(): Date {
    return this._expires;
  }

  get revoked(): boolean {
    return this._revoked;
  }

  get type(): TokenType {
    return this._type;
  }
}
