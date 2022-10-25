export type OutputCreateToken = {
  tokenId: string;
  userId: string;
};

export interface ITokenService {
  generateToken(userId: string): Promise<string>;
  generateRecoverPasswordToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<OutputCreateToken | never>;
}
