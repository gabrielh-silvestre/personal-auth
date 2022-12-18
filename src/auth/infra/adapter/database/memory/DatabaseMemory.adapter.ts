import { Injectable } from '@nestjs/common';

import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseAdapter } from '../Database.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

@Injectable()
export class DatabaseMemoryAdapter implements IDatabaseAdapter {
  private static TOKENS: Token[] = [];

  async findAll(): Promise<Token[]> {
    return DatabaseMemoryAdapter.TOKENS;
  }

  async findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null> {
    const objEntries = Object.entries(dto);

    const foundToken = DatabaseMemoryAdapter.TOKENS.find((token) => {
      return objEntries.every(([key, value]) => token[key] === value);
    });

    return foundToken || null;
  }

  async create(entity: Token): Promise<void> {
    const foundToken = DatabaseMemoryAdapter.TOKENS.findIndex(
      ({ userId }) => userId === entity.userId,
    );

    if (foundToken === -1) {
      DatabaseMemoryAdapter.TOKENS.push(entity);
    } else {
      DatabaseMemoryAdapter.TOKENS[foundToken] = entity;
    }
  }

  async update(entity: Token): Promise<void> {
    const foundIndex = DatabaseMemoryAdapter.TOKENS.findIndex(
      (token) => token.id === entity.id,
    );

    if (foundIndex === -1) {
      DatabaseMemoryAdapter.TOKENS.push(entity);
    } else {
      DatabaseMemoryAdapter.TOKENS[foundIndex] = entity;
    }
  }

  async delete(id: string): Promise<void> {
    const foundIndex = DatabaseMemoryAdapter.TOKENS.findIndex(
      (token) => token.id === id,
    );

    if (foundIndex !== -1) {
      DatabaseMemoryAdapter.TOKENS.splice(foundIndex, 1);
    }
  }

  static reset(tokens: Token[]): void {
    DatabaseMemoryAdapter.TOKENS.length = 0;
    DatabaseMemoryAdapter.TOKENS.push(...tokens);
  }
}
