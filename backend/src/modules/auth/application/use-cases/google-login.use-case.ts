import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';
import { IGoogleLoginInput } from '../dto/google-login.input';
import { AppConfig } from '../../../../shared/config/configuration';
import { DomainException } from '../../../../shared/common/exceptions/domain.exception';

/** Dedicated 501 for features intentionally not enabled yet */
class NotImplementedException extends DomainException {
  constructor(message: string, code = 'NOT_IMPLEMENTED') {
    super(message, code, HttpStatus.NOT_IMPLEMENTED);
  }
}

@Injectable()
export class GoogleLoginUseCase {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  async execute(_input: IGoogleLoginInput) {
    const enabled =
      this.configService.get('auth.googleEnabled', { infer: true }) === true;

    if (!enabled) {
      throw new NotImplementedException(
        'Google login is not enabled. Set GOOGLE_AUTH_ENABLED=true when ready.',
        'GOOGLE_AUTH_DISABLED',
      );
    }

    // TODO: Implement Google Login Flow when GOOGLE_AUTH_ENABLED and frontend are ready
    //
    // Step 1: Verify the Google ID Token (google-auth-library)
    // Step 2: Find or create User + AuthAccount (googleId)
    // Step 3: Issue access + refresh tokens
    //
    throw new UnauthorizedException(
      'Google Login is not implemented yet',
      'NOT_IMPLEMENTED',
    );
  }
}
