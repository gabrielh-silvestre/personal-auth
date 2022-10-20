import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { ParseHalJsonInterceptor } from '@users/infra/api/interceptor/Parse.hal-json.interceptor';
import { ExceptionFilterRpc } from '@users/infra/api/filter/ExceptionFilter.grpc';

@Controller('/auth')
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(data: InputLoginDto): Promise<{ token: string } | never> {
    return {
      token: await this.loginUseCase.execute(data),
    };
  }

  @Post('/login')
  @UseInterceptors(new ParseHalJsonInterceptor<{ token: string }>())
  async handleRest(
    @Body() data: InputLoginDto,
  ): Promise<{ token: string } | never> {
    return this.handle(data);
  }

  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('AuthService', 'LoginUser')
  async handleGrpc(data: InputLoginDto): Promise<{ token: string } | never> {
    return this.handle(data);
  }
}
