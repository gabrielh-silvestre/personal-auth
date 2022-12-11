export type AuthGatewayOutput = {
  userId: string;
};

export interface IAuthGateway {
  verify(token: string): Promise<AuthGatewayOutput | null>;
}
