import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { GrpcMethod } from '@nestjs/microservices';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from '@users/useCase/create/CreateUser.dto';

import { CreateUserUseCase } from '@users/useCase/create/CreateUser.useCase';

import { ParseHalJsonInterceptor } from '../../interceptor/Parse.hal-json.interceptor';
import { ExceptionFilterRpc } from '../../filter/ExceptionFilter.grpc';

@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  private async handle(data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const { id, username } = await this.createUserUseCase.execute(data);
    return { id, username };
  }

  @Post()
  @UseInterceptors(new ParseHalJsonInterceptor<OutputCreateUserDto>())
  async handleRest(
    @Body() data: InputCreateUserDto,
  ): Promise<OutputCreateUserDto> {
    return this.handle(data);
  }

  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('UserService', 'CreateUser')
  async handleGrpc(data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    return this.handle(data);
  }
}
