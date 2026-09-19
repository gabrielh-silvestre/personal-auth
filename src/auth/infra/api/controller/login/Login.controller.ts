import type { Request as IRequest } from 'express';

import {
  Controller,
  Post,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';

import type { InputLoginDto } from '@auth/useCase/login/Login.dto.js';

import { LoginUseCase } from '@auth/useCase/login/Login.useCase.js';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service.js';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service.js';

import { CredentialsGuard } from '../../guard/CredentialsGuard.guard.js';
import { ParseHalJsonInterceptor } from '@shared/infra/interceptor/Parse.hal-json.interceptor.js';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc.js';

type ResponseLogin = {
  access: string;
  refresh: string;
};

@Controller('/auth')
export class LoginController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtAccess: JwtAccessService,
    private readonly jwtRefresh: JwtRefreshService,
  ) {}

  async handle(data: InputLoginDto): Promise<ResponseLogin | never> {
    const { accessTokenId, refreshTokenId, userId } =
      await this.loginUseCase.execute(data);

    const access = await this.jwtAccess.sign({
      tokenId: accessTokenId,
      userId,
    });
    const refresh = await this.jwtRefresh.sign({
      tokenId: refreshTokenId,
      userId,
    });

    return { access, refresh };
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
  async handleGrpc(@Payload() data: IRequest): Promise<ResponseLogin | never> {
    return this.handle({ userId: data.user.userId });
  }
}
