import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmUserDto } from '../orm.interface';

import { User } from '@user/domain/entity/User';

export class OrmMemoryAdapter implements IOrmAdapter<OrmUserDto> {
  private static USERS: OrmUserDto[] = [];

  async findAll(): Promise<OrmUserDto[]> {
    return OrmMemoryAdapter.USERS;
  }

  async findOne<K extends Partial<OrmUserDto>>(dto: K): Promise<OrmUserDto> {
    const objEntries = Object.entries(dto);

    const foundData = OrmMemoryAdapter.USERS.find((item) => {
      return objEntries.every(([key, value]) => item[key] === value);
    });

    return foundData || null;
  }

  async create(data: OrmUserDto): Promise<void> {
    OrmMemoryAdapter.USERS.push(data);
  }

  async update(id: string, data: OrmUserDto): Promise<void> {
    const foundIndex = OrmMemoryAdapter.USERS.findIndex(
      (item) => item.id === id,
    );

    if (foundIndex !== -1) OrmMemoryAdapter.USERS[foundIndex] = data;
  }

  async delete(id: string): Promise<void> {
    const foundIndex = OrmMemoryAdapter.USERS.findIndex(
      (user) => user.id === id,
    );

    if (foundIndex !== -1) {
      OrmMemoryAdapter.USERS.splice(foundIndex, 1);
    }
  }

  static reset(users: User[]): void {
    OrmMemoryAdapter.USERS.length = 0;
    OrmMemoryAdapter.USERS.push(...users);
  }
}
