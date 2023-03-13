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

export interface IOrmAdapter {
  findAll(): Promise<OrmTokenDto[]>;
  findOne<T extends Partial<OrmTokenDto>>(dto: T): Promise<OrmTokenDto | null>;
  create(data: OrmTokenDto): Promise<void>;
  update(data: OrmTokenDto): Promise<void>;
  delete(id: string): Promise<void>;
}
