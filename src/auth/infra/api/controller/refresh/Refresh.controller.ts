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

import type { InputRefreshDto } from '@auth/useCase/refresh/Refresh.dto';
import type { TokenPayload } from '@auth/infra/gateway/token/token.gateway.interface';

import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

import { RefreshTokenGuard } from '../../guard/RefreshToken.guard';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';
import { ParseHalJsonInterceptor } from '@shared/infra/interceptor/Parse.hal-json.interceptor';

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

    const access = await this.accessTokenService.sign<TokenPayload>({
      tokenId: accessTokenId,
      userId,
    });
    const refresh = await this.refreshTokenService.sign<TokenPayload>({
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
