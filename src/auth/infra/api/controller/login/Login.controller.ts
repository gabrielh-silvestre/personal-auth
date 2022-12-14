import type { Request as IRequest } from 'express';

import {
  Controller,
  Post,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { CredentialsGuard } from '../../guard/CredentialsGuard.guard';
import { ParseHalJsonInterceptor } from '@shared/infra/interceptor/Parse.hal-json.interceptor';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

type ResponseLogin = {
  access: string;
  refresh: string;
};

@Controller('/auth')
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(data: InputLoginDto): Promise<ResponseLogin | never> {
    const { accessTokenId, refreshTokenId } = await this.loginUseCase.execute(
      data,
    );

    return {
      access: accessTokenId,
      refresh: refreshTokenId,
    };
  }

  @UseGuards(CredentialsGuard)
  @Post('/login')
  @UseInterceptors(new ParseHalJsonInterceptor<ResponseLogin>())
  async handleRest(@Request() data: IRequest): Promise<ResponseLogin | never> {
    return this.handle({ userId: data.user.userId });
  }

  @UseGuards(CredentialsGuard)
  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('AuthService', 'LoginUser')
  async handleGrpc(data: InputLoginDto): Promise<ResponseLogin | never> {
    return this.handle(data);
  }
}
