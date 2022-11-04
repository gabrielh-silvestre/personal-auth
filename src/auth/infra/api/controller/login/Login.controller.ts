import {
  Body,
  Controller,
  Inject,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { CredentialsGuard } from '../../guard/CredentialsGuard.guard';
import { ParseHalJsonInterceptor } from '@users/infra/api/interceptor/Parse.hal-json.interceptor';
import { ExceptionFilterRpc } from '@users/infra/api/filter/ExceptionFilter.grpc';

type ResponseLogin = {
  access: string;
  refresh: string;
};

@Controller('/auth')
export class LoginController {
  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly accessTokenService: JwtService,
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: JwtService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async handle(data: InputLoginDto): Promise<ResponseLogin | never> {
    const token = await this.loginUseCase.execute(data);

    const access = await this.accessTokenService.signAsync(token);
    const refresh = await this.refreshTokenService.signAsync(token);

    return { access, refresh };
  }

  @UseGuards(CredentialsGuard)
  @Post('/login')
  @UseInterceptors(new ParseHalJsonInterceptor<ResponseLogin>())
  async handleRest(
    @Body() data: InputLoginDto,
  ): Promise<ResponseLogin | never> {
    return this.handle(data);
  }

  @UseGuards(CredentialsGuard)
  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('AuthService', 'LoginUser')
  async handleGrpc(data: InputLoginDto): Promise<ResponseLogin | never> {
    return this.handle(data);
  }
}
