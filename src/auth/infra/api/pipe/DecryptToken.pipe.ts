import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';

export type OutPutDecryptToken = {
  tokenId: string;
  userId: string;
};

@Injectable()
export class DecryptTokenPipe
  implements PipeTransform<string, Promise<OutPutDecryptToken>>
{
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
  ) {}

  transform(
    value: string,
    _metadata: ArgumentMetadata,
  ): Promise<OutPutDecryptToken> {
    return this.tokenService.verifyToken(value);
  }
}
