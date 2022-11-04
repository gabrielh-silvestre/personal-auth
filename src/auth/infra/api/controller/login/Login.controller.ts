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

@Controller('/auth')
export class LoginController {
  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly accessTokenService: JwtService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async handle(data: InputLoginDto): Promise<{ token: string } | never> {
    const token = await this.loginUseCase.execute(data);
    const jwtToken = await this.accessTokenService.signAsync(token);

    return { token: jwtToken };
  }

  @UseGuards(CredentialsGuard)
  @Post('/login')
  @UseInterceptors(new ParseHalJsonInterceptor<{ token: string }>())
  async handleRest(
    @Body() data: InputLoginDto,
  ): Promise<{ token: string } | never> {
    return this.handle(data);
  }

  @UseGuards(CredentialsGuard)
  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('AuthService', 'LoginUser')
  async handleGrpc(data: InputLoginDto): Promise<{ token: string } | never> {
    return this.handle(data);
  }
}
