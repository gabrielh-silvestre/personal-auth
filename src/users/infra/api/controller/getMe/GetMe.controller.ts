import type { Request as IRequest } from 'express';
import {
  Body,
  Controller,
  Get,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { AuthenticateGuard } from '@auth/infra/api/guard/Authenticate.guard';
import { DecryptTokenPipe } from '@auth/infra/api/pipe/DecryptToken.pipe';
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

  @UseGuards(AuthenticateGuard)
  @Get('/me')
  @UseInterceptors(new ParseHalJsonInterceptor<string>())
  async handleRest(@Request() data: IRequest): Promise<OutPutGetMe> {
    return this.handle(data.user.userId);
  }

  @UseGuards(AuthenticateGuard)
  @GrpcMethod('UserService', 'GetMe')
  async handleGrpc(
    @Body(DecryptTokenPipe) data: { userId: string },
  ): Promise<OutPutGetMe> {
    return this.handle(data.userId);
  }
}
