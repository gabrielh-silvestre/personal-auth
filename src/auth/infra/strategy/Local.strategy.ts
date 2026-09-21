import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import type { IUserGateway } from '#auth/infra/gateway/user/user.gateway.interface';

import { Exception } from '#exceptions/entity/Exception';
import { ExceptionFactory } from '#exceptions/factory/Exception.factory';

import { USER_GATEWAY } from '#auth/utils/constants/index';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(LocalStrategy.name);

  constructor(
    @Inject(USER_GATEWAY) private readonly userGateway: IUserGateway,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<{ userId: string }> {
    try {
      const { id } = await this.userGateway.verifyCredentials(email, password);

      return { userId: id };
    } catch (error) {
      // UserGateway only wraps genuine infra failures (timeout) into an
      // Exception; anything else is the user service's own rejection.
      if (error instanceof Exception) {
        const cause = error instanceof Error ? error : new Error(String(error));
        this.logger.error(cause.message, cause.stack);

        throw error;
      }

      // A wrong password is an expected outcome, not a system failure: it is
      // logged without the stack and without the email, so a brute-force
      // attempt cannot flood the log or fill it with user identifiers.
      this.logger.warn('Credential check rejected');

      throw ExceptionFactory.forbidden('Invalid credentials');
    }
  }
}
