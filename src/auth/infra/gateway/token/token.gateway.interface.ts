export type TokenPayload = {
  userId: string;
  tokenId: string;
};

export interface ITokenGateway {
  generateAccessToken(userId: string): Promise<string | never>;
  generateRecoverPasswordToken(userId: string): Promise<string | never>;
  generateRefreshToken(userId: string): Promise<string | never>;
  verifyToken(token: string): Promise<TokenPayload | never>;
}
