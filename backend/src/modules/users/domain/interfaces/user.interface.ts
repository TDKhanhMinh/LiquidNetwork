import { AlcoholToleranceLevel } from '../enums/alcohol-tolerance-level.enum';

export interface IDrunkProfile {
  occupation?: string;
  education?: string;
  selfIntroduction?: string;
}

export interface IPrivacySettings {
  hideProfile: boolean;
  hideLevel: boolean;
}

export interface IUser {
  _id?: string;
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  bio?: string;
  
  drunkProfile: IDrunkProfile;
  alcoholToleranceLevel: AlcoholToleranceLevel;
  privacySettings: IPrivacySettings;
  
  sessionsJoined: number;
  invitationAcceptRate: number; // percentage (0-100)
  averageRating: number;
  totalReviews: number;
  
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
