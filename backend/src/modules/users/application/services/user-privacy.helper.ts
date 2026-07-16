import { IUser } from '../../domain/interfaces/user.interface';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

export interface ProfileAccessContext {
  isOwner: boolean;
  includeLevel: boolean;
}

/**
 * Resolve access flags and enforce hideProfile for non-owners.
 * Throws NotFound (not Forbidden) so hidden profiles are not enumerable.
 */
export function assertCanViewProfile(
  user: IUser,
  requesterId: string,
): ProfileAccessContext {
  const targetId = (user as any)._id?.toString?.() ?? (user as any)._id;
  const isOwner = String(targetId) === String(requesterId);

  if (!isOwner && user.privacySettings?.hideProfile) {
    throw new NotFoundException('User not found', 'USER_NOT_FOUND');
  }

  const includeLevel = isOwner || !user.privacySettings?.hideLevel;

  return { isOwner, includeLevel };
}
