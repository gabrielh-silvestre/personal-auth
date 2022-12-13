export type OutputUser = {
  id: string;
};

export interface IUserGateway {
  verifyCredentials(
    email: string,
    password: string,
  ): Promise<OutputUser | never>;
}
