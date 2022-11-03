import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TOKEN_EXPIRES_IN, TOKEN_SECRET } from '@shared/utils/constants';

type JwtModuleOptions = {
  name: string;
};

@Module({})
export class CustomJwtModule {
  public static register({ name }: JwtModuleOptions): DynamicModule {
    return {
      module: CustomJwtModule,
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>(`JWT_${name}_SECRET`, 'secret'),
            verifyOptions: {
              maxAge: configService.get<number>(TOKEN_SECRET(name), 86400),
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
