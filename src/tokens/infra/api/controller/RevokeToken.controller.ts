import type { Request } from 'express';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { RevokeTokenUseCase } from '@tokens/useCase/revoke/RevokeToken.useCase';

import { AuthenticateGuard } from '@auth/infra/api/guard/Authenticate.guard';
import { ExceptionFilterRpc } from '@users/infra/api/filter/ExceptionFilter.grpc';

@Controller()
export class RevokeTokenController {
  constructor(private readonly revokeTokenUseCase: RevokeTokenUseCase) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @GrpcMethod('TokenService', 'RevokeToken')
  async handle(data: Request): Promise<{ success: boolean }> {
    console.log({ data });
    return this.revokeTokenUseCase
      .execute(data.user.tokenId)
      .then(() => ({ success: true }))
      .catch(() => ({ success: false }));
  }
}
