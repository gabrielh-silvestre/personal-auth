import { Injectable } from '@nestjs/common';

import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

@Injectable()
export class MongoLikeDatabaseAdapter implements IDatabaseAdapter {
  private tokens: Token[] = [];

  async findAll(): Promise<Token[]> {
    return this.tokens;
  }

  async findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null> {
    const entries = Object.entries(dto);
    return (
      this.tokens.find((token) =>
        entries.every(([key, value]) => token[key] === value),
      ) ?? null
    );
  }

  async create(entity: Token): Promise<void> {
    const index = this.tokens.findIndex(
      (token) => token.userId === entity.userId && token.type === entity.type,
    );

    if (index === -1) {
      this.tokens.push(entity);
    } else {
      this.tokens[index] = entity;
    }
  }

  async update(entity: Token): Promise<void> {
    const index = this.tokens.findIndex((token) => token.id === entity.id);

    if (index !== -1) this.tokens[index] = entity;
  }

  async delete(id: string): Promise<void> {
    this.tokens = this.tokens.filter((token) => token.id !== id);
  }

  reset(tokens: Token[] = []): void {
    this.tokens = [...tokens];
  }
}
