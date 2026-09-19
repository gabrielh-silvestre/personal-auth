import type { Request } from 'express';

import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import type { OutputVerifyTokenDto } from '@auth/useCase/verifyToken/VerifyToken.dto.js';

import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase.js';

import { AuthenticateGuard } from '../../guard/Authenticate.guard.js';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc.js';

@Controller()
export class VerifyTokenController {
  constructor(private readonly verifyTokenUseCase: VerifyTokenUseCase) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.verify_token')
  async handle(
    @Payload() data: Request,
  ): Promise<OutputVerifyTokenDto | never> {
    const { userId } = await this.verifyTokenUseCase.execute({
      tokenId: data.user.tokenId,
    });

    return { userId };
  }
}
