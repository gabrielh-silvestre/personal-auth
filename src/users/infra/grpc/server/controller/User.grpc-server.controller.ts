import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { GrpcReponse } from 'src/shared/dto/GrpcReponse.interface';
import type {
  InputCreateUserDto,
  ReponseCreateUserDto,
} from 'src/users/dto/CreateUser.dto';

import { UserService } from '../../../../user.service';
import { ExceptionFilterRpc } from 'src/shared/infra/exception-filter/ExceptionFilter.grpc';

@Controller()
@UseFilters(new ExceptionFilterRpc())
export class UserGrpcServerController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService')
  async createUser(
    data: InputCreateUserDto,
  ): Promise<GrpcReponse<ReponseCreateUserDto>> {
    const { id, username } = await this.userService.create(data);
    return { user: { id, username } };
  }
}
