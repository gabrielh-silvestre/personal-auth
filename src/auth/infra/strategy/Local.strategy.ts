import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import type { IUserGateway } from '../gateway/user/user.gateway.interface';

import { Exception } from '@exceptions/entity/Exception';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { USER_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @Inject(USER_GATEWAY) private readonly userGateway: IUserGateway,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const { id } = await this.userGateway.verifyCredentials(email, password);

      return { userId: id };
    } catch (error) {
      if (error instanceof Exception) {
        // Falha de infraestrutura já tratada e tipada (ex.: timeout do serviço de
        // usuários, ver User.gateway.ts). Propaga como está, sem mascarar como
        // credencial inválida.
        throw error;
      }

      this.logger.warn(`Invalid credentials attempt for ${email}: ${(error as Error).message}`);
      throw ExceptionFactory.forbidden('Invalid credentials');
    }
  }
}
