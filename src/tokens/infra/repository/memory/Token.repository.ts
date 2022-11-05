import { Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { Token } from '@tokens/domain/entity/Token';
import { TokenType } from '@tokens/domain/entity/token.interface';

@Injectable()
export class TokenInMemoryRepository implements ITokenRepository {
  private static TOKENS: Token[] = [];

  async create(entity: Token): Promise<void> {
    const foundToken = TokenInMemoryRepository.TOKENS.findIndex(
      ({ userId }) => userId === entity.userId,
    );

    if (foundToken === -1) {
      TokenInMemoryRepository.TOKENS.push(entity);
    } else {
      TokenInMemoryRepository.TOKENS[foundToken] = entity;
    }
  }

  async update(entity: Token): Promise<void> {
    const foundIndex = TokenInMemoryRepository.TOKENS.findIndex(
      (token) => token.id === entity.id,
    );

    if (foundIndex === -1) {
      TokenInMemoryRepository.TOKENS.push(entity);
    } else {
      TokenInMemoryRepository.TOKENS[foundIndex] = entity;
    }
  }

  async find(id: string): Promise<Token> {
    const foundToken = TokenInMemoryRepository.TOKENS.find(
      (token) => token.id === id,
    );

    return foundToken || null;
  }

  async findByUserIdAndType(userId: string, type: TokenType): Promise<Token> {
    const foundToken = TokenInMemoryRepository.TOKENS.find(
      (token) => token.userId === userId && token.type === type,
    );

    return foundToken || null;
  }

  static reset(tokens: Token[]): void {
    TokenInMemoryRepository.TOKENS.length = 0;
    TokenInMemoryRepository.TOKENS.push(...tokens);
  }
}
