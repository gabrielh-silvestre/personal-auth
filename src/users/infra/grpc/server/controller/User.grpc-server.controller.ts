import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputCreateUserDto } from 'src/users/dto/CreateUser.dto';

import { UserService } from '../../../../user.service';

@Controller()
export class UserGrpcServerController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService')
  async createUser(data: InputCreateUserDto) {
    return this.userService.create(data);
  }
}
