import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

export interface DrunkProfileData {
  occupation?: string;
  education?: string;
  selfIntroduction?: string;
}

export interface PrivacySettingsData {
  hideProfile?: boolean;
  hideLevel?: boolean;
}

export interface CreateUserCommand {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified?: boolean;
}

export interface UpdateUserCommand {
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateDrunkProfileCommand {
  drunkProfile: DrunkProfileData;
}

export interface UpdatePrivacySettingsCommand {
  privacySettings: PrivacySettingsData;
}

export interface UpdateToleranceLevelCommand {
  level: AlcoholToleranceLevel;
}
