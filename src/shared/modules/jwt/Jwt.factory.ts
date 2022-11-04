import { DynamicModule, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { TOKEN_EXPIRES_IN, TOKEN_SECRET } from '@shared/utils/constants';

type JwtModuleOptions = {
  name: string;
};

@Injectable()
export class JwtFactory {
  public static register({ name }: JwtModuleOptions): DynamicModule {
    return {
      module: JwtFactory,
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>(TOKEN_SECRET(name), 'secret'),
            verifyOptions: {
              maxAge: configService.get<number>(TOKEN_EXPIRES_IN(name), 86400),
            },
            signOptions: {
              expiresIn: configService.get<number>(
                TOKEN_EXPIRES_IN(name),
                86400,
              ),
            },
          }),
        }),
      ],
      exports: [JwtModule],
    };
  }
}
