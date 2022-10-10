export interface IToken {
  id: string;
  userId: string;
  lastRefresh: Date;
  expires: Date;
  revoked: boolean;
}
