export type TokenPayload = {
  userId: string;
  tokenId: string;
};

export interface ITokenService {
  generateAccessToken(userId: string): Promise<TokenPayload | never>;
  generateRecoverPasswordToken(userId: string): Promise<TokenPayload | never>;
  generateRefreshToken(userId: string): Promise<TokenPayload | never>;
  verifyToken(token: string): Promise<TokenPayload | never>;
}
