export type InputRecoverPasswordMail = {
  email: string;
  username: string;
  token: string;
};

export interface IMailService {
  recoverPasswordMail(data: InputRecoverPasswordMail): Promise<void>;
}
