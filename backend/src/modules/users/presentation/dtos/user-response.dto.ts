import { IUser } from '../../domain/interfaces/user.interface';

export interface UserResponseOptions {
  /** When false, alcoholToleranceLevel is omitted. Default true for owner views. */
  includeLevel?: boolean;
  /** Owner sees email + privacySettings. Default false (public-safe). */
  isOwner?: boolean;
}

export class UserResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  drunkProfile: any;
  alcoholToleranceLevel?: string;
  privacySettings?: any;
  sessionsJoined: number;
  invitationAcceptRate: number;
  averageRating: number;
  totalReviews: number;

  constructor(user: IUser, options: UserResponseOptions = {}) {
    const isOwner = options.isOwner === true;
    const includeLevel =
      options.includeLevel !== undefined
        ? options.includeLevel
        : isOwner;

    this.id = (user as any).id || (user as any)._id?.toString();
    this.name = user.name;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.bio = user.bio;
    this.drunkProfile = user.drunkProfile;
    this.sessionsJoined = user.sessionsJoined;
    this.invitationAcceptRate = user.invitationAcceptRate;
    this.averageRating = user.averageRating;
    this.totalReviews = user.totalReviews;

    if (isOwner) {
      this.email = user.email;
      this.privacySettings = user.privacySettings;
    }

    if (includeLevel) {
      this.alcoholToleranceLevel = user.alcoholToleranceLevel;
    }
  }
}
