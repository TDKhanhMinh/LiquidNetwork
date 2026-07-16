import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './presentation/http/auth.controller';
import { AuthService } from './application/services/auth.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { PasswordService } from './infrastructure/services/password.service';
import { TokenService } from './infrastructure/services/token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import {
  RefreshToken,
  RefreshTokenSchema,
} from './infrastructure/persistence/schemas/refresh-token.schema';
import {
  AuthAccount,
  AuthAccountSchema,
} from './infrastructure/persistence/schemas/auth-account.schema';
import { RefreshTokenMongooseRepository } from './infrastructure/persistence/repositories/refresh-token.mongoose.repository';
import { AuthAccountMongooseRepository } from './infrastructure/persistence/repositories/auth-account.mongoose.repository';

import { UsersModule } from '../users/users.module';
import { AppConfig } from '../../shared/config/configuration';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: AuthAccount.name, schema: AuthAccountSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<AppConfig, true>,
      ): JwtModuleOptions => ({
        secret: configService.get('jwt.secret', { infer: true }) || '',
        signOptions: {
          expiresIn: (configService.get('jwt.expiresIn', { infer: true }) ||
            '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GoogleLoginUseCase,
    {
      provide: 'IPasswordService',
      useClass: PasswordService,
    },
    {
      provide: 'ITokenService',
      useClass: TokenService,
    },
    JwtStrategy,
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenMongooseRepository,
    },
    {
      provide: 'IAuthAccountRepository',
      useClass: AuthAccountMongooseRepository,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
