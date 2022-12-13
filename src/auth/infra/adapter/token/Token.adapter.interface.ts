export type TokenType = 'ACCESS' | 'REFRESH' | 'RECOVER_PASSWORD';

export type TokenPayload = {
  userId: string;
  tokenId: string;
};

export interface ITokenAdapter {
  generate(userId: string, type: TokenType): Promise<string | never>;
  verify(token: string): Promise<TokenPayload | never>;
}
