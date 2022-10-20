export interface IJwtService<T = unknown> {
  encrypt(data: T): Promise<string>;
  decrypt(token: string): Promise<T>;
}
