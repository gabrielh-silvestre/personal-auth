import type { Request as IRequest } from 'express';

import {
  Body,
  Controller,
  Get,
  Inject,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GrpcMethod } from '@nestjs/microservices';

import type { InputRefreshDto } from '@auth/useCase/refresh/Refresh.dto';

import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase';

import { RefreshTokenGuard } from '../../guard/RefreshToken.guard';
import { ExceptionFilterRpc } from '@users/infra/api/filter/ExceptionFilter.grpc';
import { ParseHalJsonInterceptor } from '@users/infra/api/interceptor/Parse.hal-json.interceptor';

@Controller('/auth')
export class RefreshController {
  constructor(
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: JwtService,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  private async handle(
    data: InputRefreshDto,
  ): Promise<{ token: string } | never> {
    const token = await this.refreshUseCase.execute(data);
    const jwtToken = await this.refreshTokenService.signAsync(token);

    return { token: jwtToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  @UseInterceptors(new ParseHalJsonInterceptor<{ token: string }>())
  async handleRest(
    @Request() data: IRequest,
  ): Promise<{ token: string } | never> {
    return this.handle(data.user);
  }

  @UseFilters(new ExceptionFilterRpc())
  @UseGuards(RefreshTokenGuard)
  @GrpcMethod('AuthService', 'RefreshToken')
  async handleGrpc(@Body() data: IRequest): Promise<{ token: string } | never> {
    return this.handle(data.user);
  }
}
