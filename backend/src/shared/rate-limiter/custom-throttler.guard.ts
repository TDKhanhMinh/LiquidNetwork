import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TooManyRequestsException } from '../common/exceptions/too-many-requests.exception';

/**
 * Prefer authenticated user id for rate-limit keys (multi-user behind NAT).
 * Falls back to JWT payload `sub` (best-effort, before JwtAuthGuard) then IP.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId =
      req.user?.id ??
      req.user?.sub ??
      this.extractJwtSub(req.headers?.authorization);

    if (userId) {
      return `user:${userId}`;
    }

    return (
      req.ips?.length ? req.ips[0] : req.ip
    )?.toString?.() || 'anonymous';
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new TooManyRequestsException();
  }

  private extractJwtSub(authorization?: string): string | null {
    if (!authorization || typeof authorization !== 'string') return null;
    const [scheme, token] = authorization.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;

    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadJson = Buffer.from(parts[1]!, 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson) as { sub?: string };
      return payload.sub ? String(payload.sub) : null;
    } catch {
      return null;
    }
  }
}
