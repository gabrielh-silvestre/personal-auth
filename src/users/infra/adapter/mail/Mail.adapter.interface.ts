export type InputBody = {
  text: string;
  html: string;
};

export interface IMailAdapter {
  send(to: string, subject: string, body: InputBody): Promise<void>;
}
