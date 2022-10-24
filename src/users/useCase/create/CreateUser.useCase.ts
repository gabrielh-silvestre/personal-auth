import { Inject, Injectable } from '@nestjs/common';

import type { IUser } from '@users/domain/entity/user.interface';
import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { InputCreateUserDto, OutputCreateUserDto } from './CreateUser.dto';
import type { IMailService } from '@users/infra/service/mail/mail.service.interface';

import { UserFactory } from '@users/domain/factory/User.factory';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
    @Inject('MAIL_SERVICE') private readonly mailService: IMailService,
  ) {}

  private async isEmailAlreadyInUse(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
  }

  private async createUserEmail(user: IUser): Promise<void | never> {
    this.mailService.welcomeMail(user);
  }

  async execute({
    email,
    confirmEmail,
    username,
    password,
    confirmPassword,
  }: InputCreateUserDto): Promise<OutputCreateUserDto | never> {
    const newUser = UserFactory.create(
      username,
      email,
      confirmEmail,
      password,
      confirmPassword,
    );

    const emailAlreadyRegistered = await this.isEmailAlreadyInUse(email);

    if (emailAlreadyRegistered) {
      throw ExceptionFactory.conflict('Email already registered');
    }

    await this.userRepository.create(newUser);
    this.createUserEmail(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
