import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { ValidateTokenGuard } from '@tokens/infra/api/guard/ValidateToken.guard';
import { RecoverTokenPayloadPipe } from '@tokens/infra/api/pipe/RecoverTokenPayload.pipe';

import { ParseHalJsonInterceptor } from '../../interceptor/Parse.hal-json.interceptor';
// import { ExceptionFilterRpc } from '../../filter/ExceptionFilter.grpc';

type OutPutGetMe = {
  id: string;
  username: string;
};

@Controller('/users')
export class GetMeController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  @Get('/me/:token')
  @UseGuards(ValidateTokenGuard)
  @UseInterceptors(new ParseHalJsonInterceptor<OutPutGetMe>())
  async handle(
    @Param(RecoverTokenPayloadPipe) data: { id: string },
  ): Promise<OutPutGetMe> {
    const { id, username } = await this.getUserByIdUseCase.execute(data.id);
    return { id, username };
  }

  // @UseGuards(ValidateTokenGuard)
  // @UseFilters(new ExceptionFilterRpc())
  // @GrpcMethod('UserService', 'RecoverUser')
  // async handleGrpc(
  //   @Body(RecoverTokenPayloadPipe) data: { id: string },
  // ): Promise<OutPutGetMe> {
  //   const { id, username } = await this.getUserByIdUseCase.execute(data.id);
  //   return { id, username };
  // }
}
