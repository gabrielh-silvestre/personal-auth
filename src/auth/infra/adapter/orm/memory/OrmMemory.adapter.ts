import { Injectable } from '@nestjs/common';

import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmTokenDto } from '../orm.interface';

import { Token } from '@auth/domain/entity/Token';

@Injectable()
export class OrmMemoryAdapter implements IOrmAdapter<OrmTokenDto> {
  private static TOKENS: OrmTokenDto[] = [];

  async findAll(): Promise<OrmTokenDto[]> {
    return OrmMemoryAdapter.TOKENS;
  }

  async findOne<T extends Partial<OrmTokenDto>>(
    dto: T,
  ): Promise<OrmTokenDto | null> {
    const objEntries = Object.entries(dto);

    const foundData = OrmMemoryAdapter.TOKENS.find((item) => {
      return objEntries.every(([key, value]) => item[key] === value);
    });

    return foundData || null;
  }

  async create(dto: OrmTokenDto): Promise<void> {
    OrmMemoryAdapter.TOKENS.push(dto);
  }

  async update(id: string, dto: OrmTokenDto): Promise<void> {
    const foundIndex = OrmMemoryAdapter.TOKENS.findIndex(
      (item) => item.id === id,
    );

    if (foundIndex !== -1) OrmMemoryAdapter.TOKENS[foundIndex] = dto;
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
