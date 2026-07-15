import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

export class DrunkProfileDto {
  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  selfIntroduction?: string;
}

export class PrivacySettingsDto {
  @IsBoolean()
  @IsOptional()
  hideProfile?: boolean;

  @IsBoolean()
  @IsOptional()
  hideLevel?: boolean;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateDrunkProfileDto {
  @ValidateNested()
  @Type(() => DrunkProfileDto)
  drunkProfile: DrunkProfileDto;
}

export class UpdatePrivacySettingsDto {
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings: PrivacySettingsDto;
}

export class UpdateToleranceLevelDto {
  @IsEnum(AlcoholToleranceLevel)
  level: AlcoholToleranceLevel;
}
