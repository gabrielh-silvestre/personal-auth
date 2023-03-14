import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { InputUpdatePasswordDto } from './UpdatePassword.dto';

import { USER_REPOSITORY } from '@shared/utils/constants/injectNames';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ id, password }: InputUpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.find(id);

    if (user) {
      user.password = password;
      await this.userRepository.update(user);
    }
  }
}
