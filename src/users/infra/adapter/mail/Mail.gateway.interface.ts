export type InputBody = {
  text: string;
  html: string;
};

export interface IMailGateway {
  send(to: string, subject: string, body: InputBody): Promise<void>;
}
