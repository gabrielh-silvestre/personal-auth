import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from 'src/users/dto/CreateUser.dto';

import { UserService } from '@users/user.service';
import { ExceptionFilterRpc } from '../filter/ExceptionFilter.grpc';

@Controller()
@UseFilters(new ExceptionFilterRpc())
export class UserGrpcServerController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService')
  async createUser(data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const { id, username } = await this.userService.create(data);
    return { id, username };
  }
}
