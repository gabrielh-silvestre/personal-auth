import { Injectable } from '@nestjs/common/decorators';
import { Token } from '@tokens/domain/entity/Token';

import { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

@Injectable()
export class TokenInMemoryRepository implements ITokenRepository {
  private static TOKENS: Token[] = [];

  async findByUserId(userId: string): Promise<Token> {
    const foundToken = TokenInMemoryRepository.TOKENS.find(
      (token) => token.userId === userId,
    );

    return foundToken || null;
  }

  async create(entity: Token): Promise<void> {
    TokenInMemoryRepository.TOKENS.push(entity);
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

  static reset(tokens: Token[]): void {
    TokenInMemoryRepository.TOKENS.length = 0;
    TokenInMemoryRepository.TOKENS.push(...tokens);
  }
}
