import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from '@users/dto/CreateUser.dto';
import type {
  InputLoginUserDto,
  OutputLoginUserDto,
} from '@users/dto/LoginUser.dto';
import type { OutputRecoverUserDto } from '@users/dto/RecoverUser.dto';

import { TokenService } from '@tokens/token.service';
import { UserService } from '@users/user.service';

import { ValidateUserGuard } from '@auth/infra/guard/ValidateUser.guard';
import { ValidateTokenGuard } from '@auth/infra/guard/ValidateToken.guard';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { ExceptionFilterRpc } from '../filter/ExceptionFilter.grpc';

@Controller()
@UseFilters(new ExceptionFilterRpc())
export class UserGrpcServerController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @GrpcMethod('UserService')
  async createUser(data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const { id, username } = await this.userService.create(data);
    return { id, username };
  }

  @UseGuards(ValidateUserGuard)
  @GrpcMethod('UserService')
  async loginUser(data: InputLoginUserDto): Promise<OutputLoginUserDto> {
    const foundUser = await this.userService.findByEmail(data.email);

    if (!foundUser || !foundUser.password.isEqual(data.password)) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return this.tokenService.createToken({ userId: foundUser.id });
  }

  @UseGuards(ValidateTokenGuard)
  @GrpcMethod('UserService')
  async recoverUser(data: { token: string }): Promise<OutputRecoverUserDto> {
    const { userId } = await this.tokenService.recoverTokenPayload(data.token);

    return this.userService.getUser(userId);
  }
}
