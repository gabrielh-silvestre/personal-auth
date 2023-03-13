import { Injectable } from '@nestjs/common';

import type { IOrmAdapter, OrmTokenDto } from '../Orm.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

@Injectable()
export class OrmMemoryAdapter implements IOrmAdapter {
  private static TOKENS: Token[] = [];

  private static convertToOrm(token: Token): OrmTokenDto {
    return {
      id: token.id,
      userId: token.userId,
      expireTime: token.expireTime,
      lastRefresh: token.lastRefresh,
      expires: token.expires,
      revoked: token.revoked,
      type: token.type,
    };
  }

  private static convertToEntity(token: OrmTokenDto): Token {
    return new Token(
      token.id,
      token.userId,
      token.expireTime,
      token.lastRefresh,
      token.revoked,
      token.type,
    );
  }

  async findAll(): Promise<OrmTokenDto[]> {
    return OrmMemoryAdapter.TOKENS.map(OrmMemoryAdapter.convertToOrm);
  }

  async findOne<T extends Partial<OrmTokenDto>>(
    dto: T,
  ): Promise<OrmTokenDto | null> {
    const objEntries = Object.entries(dto);

    const foundToken = OrmMemoryAdapter.TOKENS.find((token) => {
      return objEntries.every(([key, value]) => token[key] === value);
    });

    return foundToken ? OrmMemoryAdapter.convertToOrm(foundToken) : null;
  }

  async create(dto: OrmTokenDto): Promise<void> {
    const foundToken = OrmMemoryAdapter.TOKENS.findIndex(
      ({ userId }) => userId === dto.userId,
    );
    const entity = OrmMemoryAdapter.convertToEntity(dto);

    if (foundToken === -1) {
      OrmMemoryAdapter.TOKENS.push(entity);
    } else {
      OrmMemoryAdapter.TOKENS[foundToken] = entity;
    }
  }

  async update(dto: OrmTokenDto): Promise<void> {
    const foundIndex = OrmMemoryAdapter.TOKENS.findIndex(
      (token) => token.id === dto.id,
    );
    const entity = OrmMemoryAdapter.convertToEntity(dto);

    if (foundIndex === -1) {
      OrmMemoryAdapter.TOKENS.push(entity);
    } else {
      OrmMemoryAdapter.TOKENS[foundIndex] = entity;
    }
  }

  async delete(id: string): Promise<void> {
    const foundIndex = OrmMemoryAdapter.TOKENS.findIndex(
      (token) => token.id === id,
    );

    if (foundIndex !== -1) {
      OrmMemoryAdapter.TOKENS.splice(foundIndex, 1);
    }
  }

  static reset(tokens: Token[]): void {
    OrmMemoryAdapter.TOKENS.length = 0;
    OrmMemoryAdapter.TOKENS.push(...tokens);
  }
}
