import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { RevokeTokenUseCase } from '@tokens/useCase/revoke/RevokeToken.useCase';

@Controller()
export class RevokeTokenController {
  constructor(private readonly revokeTokenUseCase: RevokeTokenUseCase) {}

  @GrpcMethod('TokenService', 'RevokeToken')
  async handle(data: { tokenId: string }): Promise<{ success: boolean }> {
    return this.revokeTokenUseCase
      .execute(data.tokenId)
      .then(() => ({ success: true }))
      .catch(() => ({ success: false }));
  }
}
