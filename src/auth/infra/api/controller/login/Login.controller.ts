import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { LoginUseCase } from '@auth/useCase/login/Login.useCase';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

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
    private readonly accessTokenService: JwtAccessService,
    private readonly refreshTokenService: JwtRefreshService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async handle(data: InputLoginDto): Promise<ResponseLogin | never> {
    const token = await this.loginUseCase.execute(data);

    const access = await this.accessTokenService.sign(token);
    const refresh = await this.refreshTokenService.sign(token);

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
