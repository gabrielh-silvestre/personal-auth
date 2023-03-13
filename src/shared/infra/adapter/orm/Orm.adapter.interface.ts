import type { TokenType } from '@auth/domain/entity/token.interface';

export interface OrmTokenDto {
  id: string;
  userId: string;
  expireTime: number;
  lastRefresh: Date;
  expires: Date;
  revoked: boolean;
  type: TokenType;
}

export interface IOrmAdapter<T> {
  findAll(): Promise<T[]>;
  findOne<K extends Partial<T>>(dto: K): Promise<T | null>;
  create(data: T): Promise<void>;
  update(id: string, data: T): Promise<void>;
  delete(id: string): Promise<void>;
}
