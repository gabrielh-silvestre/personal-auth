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

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { AuthGuard } from '../../guard/Auth.guard';
import { ExceptionFilterRpc } from '../../filter/ExceptionFilter.grpc';
import { ParseHalJsonInterceptor } from '../../interceptor/Parse.hal-json.interceptor';

type OutPutGetMe = {
  id: string;
  username: string;
};

@Controller('/users')
export class GetMeController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  private async handle(userId: string): Promise<OutPutGetMe> {
    const user = await this.getUserByIdUseCase.execute(userId);

    return {
      id: user.id,
      username: user.username,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  @UseInterceptors(new ParseHalJsonInterceptor<string>())
  async handleRest(@Request() data: IRequest): Promise<OutPutGetMe> {
    return this.handle(data.user.userId);
  }

  @UseFilters(new ExceptionFilterRpc())
  @UseGuards(AuthGuard)
  @GrpcMethod('UserService', 'GetMe')
  async handleGrpc(@Body() data: IRequest): Promise<OutPutGetMe> {
    return this.handle(data.user.userId);
  }
}
