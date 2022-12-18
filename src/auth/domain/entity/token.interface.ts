export type TokenType = 'ACCESS' | 'RECOVER_PASSWORD' | 'REFRESH';

export interface IToken {
  get id(): string;
  get userId(): string;
  get expireTime(): number;
  get lastRefresh(): Date;
  get expires(): Date;
  get revoked(): boolean;
  get type(): TokenType;
}
