import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { ValidateTokenGuard } from '@tokens/infra/api/guard/ValidateToken.guard';
import { RecoverTokenPayloadPipe } from '@tokens/infra/api/pipe/RecoverTokenPayload.pipe';

type OutPutGetMe = {
  id: string;
  username: string;
};

@Controller('/users')
export class GetMeController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  @Post('/me')
  @UseGuards(ValidateTokenGuard)
  async handle(
    @Body(RecoverTokenPayloadPipe) data: { id: string },
  ): Promise<OutPutGetMe> {
    const { id, username } = await this.getUserByIdUseCase.execute(data.id);
    return { id, username };
  }

  @GrpcMethod('UserService', 'RecoverUser')
  @UseGuards(ValidateTokenGuard)
  async handleGrpc(
    @Body(RecoverTokenPayloadPipe) data: { id: string },
  ): Promise<OutPutGetMe> {
    const { id, username } = await this.getUserByIdUseCase.execute(data.id);
    return { id, username };
  }
}
