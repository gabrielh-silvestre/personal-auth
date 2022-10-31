export type OutputCreateToken = {
  tokenId: string;
  userId: string;
};

export interface ITokenService {
  generateAccessToken(userId: string): Promise<string>;
  generateRecoverPasswordToken(userId: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<OutputCreateToken | never>;
}
