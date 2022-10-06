export interface IException {
  get code(): number;
  get message(): string;
  get status(): number;
}
