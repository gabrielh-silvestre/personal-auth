import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type {
  GrpcCreateUserDto,
  InputCreateUserDto,
} from 'src/users/dto/CreateUser.dto';

import { UserService } from '../../../../user.service';

@Controller()
export class UserGrpcServerController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService')
  async createUser(data: InputCreateUserDto): Promise<GrpcCreateUserDto> {
    try {
      const { id, username } = await this.userService.create(data);
      return { user: { id, username } };
    } catch (error) {
      return {
        error: {
          code: 500,
          message: error.message,
          status: status.INTERNAL,
        },
      };
    }
  }
}
