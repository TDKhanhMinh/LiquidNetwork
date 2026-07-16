import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';
import { AppConfig } from '../../../../shared/config/configuration';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AppConfig, true>,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {
    const secret = configService.get('jwt.secret', { infer: true }) || '';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload', 'INVALID_TOKEN');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException(
        'User no longer exists or has been deactivated',
        'USER_NOT_FOUND',
      );
    }

    const userId = (user as any)._id?.toString?.() ?? (user as any)._id;

    return {
      id: userId,
      email: user.email,
      name: user.name,
    };
  }
}
