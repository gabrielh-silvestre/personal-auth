import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { GenerateTokenUseCase } from '@auth/useCase/generateToken/GenerateToken.useCase';

import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

@Controller()
export class GenerateTokenController {
  constructor(private readonly generateTokenUseCase: GenerateTokenUseCase) {}

  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.generate_recover_token')
  async handleRecoverToken(
    @Payload() { userId }: { userId: string },
  ): Promise<string | never> {
    return this.generateTokenUseCase.execute({ userId, type: 'recover' });
  }
}
