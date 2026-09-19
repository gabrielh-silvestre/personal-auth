import type { Request as IRequest } from 'express';

import {
  Body,
  Controller,
  Get,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputRefreshDto } from '@auth/useCase/refresh/Refresh.dto.js';
import type { TokenPayloadDto } from '@auth/infra/strategy/JwtPayload.dto.js';

import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase.js';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service.js';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service.js';

import { RefreshTokenGuard } from '../../guard/RefreshToken.guard.js';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc.js';
import { ParseHalJsonInterceptor } from '@shared/infra/interceptor/Parse.hal-json.interceptor.js';

type ResponseRefresh = {
  access: string;
  refresh: string;
};

@Controller('/auth')
export class RefreshController {
  constructor(
    private readonly accessTokenService: JwtAccessService,
    private readonly refreshTokenService: JwtRefreshService,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  private async handle(
    data: InputRefreshDto,
  ): Promise<ResponseRefresh | never> {
    const { accessTokenId, refreshTokenId, userId } =
      await this.refreshUseCase.execute(data);

    const access = await this.accessTokenService.sign<TokenPayloadDto>({
      tokenId: accessTokenId,
      userId,
    });
    const refresh = await this.refreshTokenService.sign<TokenPayloadDto>({
      tokenId: refreshTokenId,
      userId,
    });

    return { access, refresh };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  @UseInterceptors(new ParseHalJsonInterceptor<ResponseRefresh>())
  async handleRest(
    @Request() data: IRequest,
  ): Promise<ResponseRefresh | never> {
    return this.handle(data.user);
  }

  @UseFilters(new ExceptionFilterRpc())
  @UseGuards(RefreshTokenGuard)
  @GrpcMethod('AuthService', 'RefreshToken')
  async handleGrpc(@Body() data: IRequest): Promise<ResponseRefresh | never> {
    return this.handle(data.user);
  }
}
