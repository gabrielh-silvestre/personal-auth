export enum TokenType {
  ACCESS = 'ACCESS',
  RECOVER_PASSWORD = 'RECOVER_PASSWORD',
  REFRESH = 'REFRESH',
}

export interface IToken {
  get id(): string;
  get userId(): string;
  get lastRefresh(): Date;
  get expires(): Date;
  get revoked(): boolean;
  get type(): TokenType;
}
