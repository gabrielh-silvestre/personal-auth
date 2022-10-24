export enum TokenType {
  ACCESS,
  RECOVER_PASSWORD,
}

export interface IToken {
  get id(): string;
  get userId(): string;
  get lastRefresh(): Date;
  get expires(): Date;
  get revoked(): boolean;
  get type(): TokenType;
}
