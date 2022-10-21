import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { ValidateTokenGuard } from '@auth/infra/api/guard/ValidateToken.guard';
import { DecryptTokenPipe } from '@auth/infra/api/pipe/DecryptToken.pipe';
import { ParseHalJsonInterceptor } from '../../interceptor/Parse.hal-json.interceptor';
import { GrpcMethod } from '@nestjs/microservices';

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

  @UseGuards(ValidateTokenGuard)
  @Get('/me/:token')
  @UseInterceptors(new ParseHalJsonInterceptor<string>())
  async handleRest(
    @Param('token', DecryptTokenPipe) data: { userId: string },
  ): Promise<OutPutGetMe> {
    return this.handle(data.userId);
  }

  @UseGuards(ValidateTokenGuard)
  @GrpcMethod('UserService', 'GetMe')
  async handleGrpc(
    @Body(DecryptTokenPipe) data: { userId: string },
  ): Promise<OutPutGetMe> {
    return this.handle(data.userId);
  }
}
