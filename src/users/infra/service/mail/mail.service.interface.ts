export type InputWelcomeMail = {
  email: string;
  username: string;
};

export interface IMailService {
  welcomeMail(user: InputWelcomeMail): Promise<void>;
}
