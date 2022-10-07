import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { UserModule } from '@users/user.module';
import { AuthService } from './auth.service';
import { AuthRestController } from './infra/rest/controller/Auth.rest.controller';

import { ValidateBodyMiddleware } from './infra/rest/middleware/ValidateBody.middleware';

@Module({
  imports: [UserModule],
  controllers: [AuthRestController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateBodyMiddleware).forRoutes('auth/login');
  }
}
