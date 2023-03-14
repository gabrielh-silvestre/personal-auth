import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { InputUpdateEmailDto } from './UpdateEmail.dto';

import { USER_REPOSITORY } from '@shared/utils/constants/injectNames';

@Injectable()
export class UpdateEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ id, email }: InputUpdateEmailDto): Promise<void> {
    const user = await this.userRepository.find(id);

    if (user) {
      user.email = email;
      await this.userRepository.update(user);
    }
  }
}
