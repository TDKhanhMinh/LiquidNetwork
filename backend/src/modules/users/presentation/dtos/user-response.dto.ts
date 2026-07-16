import { IUser } from '../../domain/interfaces/user.interface';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  drunkProfile: any;
  alcoholToleranceLevel: string;
  privacySettings: any;
  sessionsJoined: number;
  invitationAcceptRate: number;
  averageRating: number;
  totalReviews: number;

  constructor(user: IUser) {
    this.id = (user as any).id || (user as any)._id?.toString();
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.bio = user.bio;
    this.drunkProfile = user.drunkProfile;
    this.alcoholToleranceLevel = user.alcoholToleranceLevel;
    this.privacySettings = user.privacySettings;
    this.sessionsJoined = user.sessionsJoined;
    this.invitationAcceptRate = user.invitationAcceptRate;
    this.averageRating = user.averageRating;
    this.totalReviews = user.totalReviews;
  }
}
