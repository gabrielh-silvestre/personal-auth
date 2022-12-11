export type InputWelcomeMail = {
  email: string;
  username: string;
};

export interface IMailGateway {
  welcomeMail(user: InputWelcomeMail): Promise<void>;
}
