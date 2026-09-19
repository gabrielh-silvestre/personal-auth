import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import type { GenerateTokenType } from '@auth/useCase/generateToken/GenerateToken.dto.js';

import { GenerateTokenUseCase } from '@auth/useCase/generateToken/GenerateToken.useCase.js';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service.js';

import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc.js';

@Controller()
export class GenerateTokenController {
  constructor(
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    private readonly jwtAccess: JwtAccessService,
  ) {}

  private async handle(data: {
    userId: string;
    type: GenerateTokenType;
  }): Promise<string> {
    const tokenId = await this.generateTokenUseCase.execute(data);

    return this.jwtAccess.sign({ tokenId, userId: data.userId });
  }

  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.generate_recover_token')
  async handleRecoverToken(
    @Payload() { userId }: { userId: string },
  ): Promise<string | never> {
    return this.handle({ userId, type: 'recover' });
  }
}
