import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

type InputRecoverTokenPayload = {
  token: string;
};

type OutputRecoverTokenPayload = {
  id: string;
};

@Injectable()
export class RecoverTokenPayloadPipe
  implements
    PipeTransform<InputRecoverTokenPayload, Promise<OutputRecoverTokenPayload>>
{
  constructor(private readonly validateTokenUseCase: ValidateTokenUseCase) {}

  async transform(
    value: InputRecoverTokenPayload,
    _metadata: ArgumentMetadata,
  ): Promise<OutputRecoverTokenPayload> {
    const { userId } = await this.validateTokenUseCase.execute(value.token);
    return { id: userId };
  }
}
