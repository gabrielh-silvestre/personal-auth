export interface IPassword {
  toString(): string;
  isEqual(password: string): boolean;
}
