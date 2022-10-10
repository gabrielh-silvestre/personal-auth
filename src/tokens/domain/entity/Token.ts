import { IToken } from './token.interface';

export class Token implements IToken {
  private static readonly EXPIRE_TIME = 1000 * 60 * 3; // expiration time: 3 minutes

  private _id: string;
  private _userId: string;
  private _lastRefresh: Date;
  private _expires: Date;
  private _revoked: boolean;

  constructor(id: string, userId: string, lastRefresh: Date, revoked: boolean) {
    this._id = id;
    this._userId = userId;
    this._lastRefresh = lastRefresh;
    this._expires = new Date(lastRefresh.getTime() + Token.EXPIRE_TIME);
    this._revoked = revoked;
  }

  isValid(): boolean {
    return !this._revoked && this._expires > new Date();
  }

  refresh(): void {
    this._lastRefresh = new Date();
    this._expires = new Date(this._lastRefresh.getTime() + Token.EXPIRE_TIME);
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

  get lastRefresh(): Date {
    return this._lastRefresh;
  }

  get expires(): Date {
    return this._expires;
  }

  get revoked(): boolean {
    return this._revoked;
  }
}
