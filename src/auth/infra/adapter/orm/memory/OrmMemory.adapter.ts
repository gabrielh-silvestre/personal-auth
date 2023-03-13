import { Injectable } from '@nestjs/common';

import type { IOrmAdapter } from '../Orm.adapter.interface';

import { Token } from '@auth/domain/entity/Token';

@Injectable()
export class OrmMemoryAdapter<T> implements IOrmAdapter<T> {
  private static DATA: any[] = [];

  async findAll(): Promise<T[]> {
    return OrmMemoryAdapter.DATA;
  }

  async findOne<K extends Partial<T>>(dto: K): Promise<T | null> {
    const objEntries = Object.entries(dto);

    const foundData = OrmMemoryAdapter.DATA.find((item) => {
      return objEntries.every(([key, value]) => item[key] === value);
    });

    return foundData || null;
  }

  async create(dto: T): Promise<void> {
    OrmMemoryAdapter.DATA.push(dto);
  }

  async update(id: string, dto: T): Promise<void> {
    const foundIndex = OrmMemoryAdapter.DATA.findIndex(
      (item) => item.id === id,
    );

    if (foundIndex !== -1) OrmMemoryAdapter.DATA[foundIndex] = dto;
  }

  async delete(id: string): Promise<void> {
    const foundIndex = OrmMemoryAdapter.DATA.findIndex(
      (token) => token.id === id,
    );

    if (foundIndex !== -1) {
      OrmMemoryAdapter.DATA.splice(foundIndex, 1);
    }
  }

  static reset(tokens: Token[]): void {
    OrmMemoryAdapter.DATA.length = 0;
    OrmMemoryAdapter.DATA.push(...tokens);
  }
}
