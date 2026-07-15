import { Injectable, Inject } from '@nestjs/graphql'; // Wait, let's just use @nestjs/common
import { Injectable as InjectableCommon } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateDrunkProfileDto, 
  UpdatePrivacySettingsDto,
  UpdateToleranceLevelDto
} from '../dtos/user.dto';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { IUser } from '../../domain/interfaces/user.interface';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

@InjectableCommon()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = {
      ...createUserDto,
      drunkProfile: {},
      alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_1,
      privacySettings: {
        hideProfile: false,
        hideLevel: false,
      },
      sessionsJoined: 0,
      invitationAcceptRate: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    return this.userRepository.create(newUser);
  }

  async findById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateBasicInfo(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    const user = await this.findById(id);
    const updated = await this.userRepository.updateById(id, updateUserDto);
    return updated!;
  }

  async updateDrunkProfile(id: string, updateDto: UpdateDrunkProfileDto): Promise<IUser> {
    const user = await this.findById(id);
    const updatedDrunkProfile = {
      ...user.drunkProfile,
      ...updateDto.drunkProfile,
    };
    const updated = await this.userRepository.updateById(id, { drunkProfile: updatedDrunkProfile });
    return updated!;
  }

  async updatePrivacySettings(id: string, updateDto: UpdatePrivacySettingsDto): Promise<IUser> {
    const user = await this.findById(id);
    const updatedPrivacy = {
      ...user.privacySettings,
      ...updateDto.privacySettings,
    };
    const updated = await this.userRepository.updateById(id, { privacySettings: updatedPrivacy });
    return updated!;
  }

  async updateToleranceLevel(id: string, updateDto: UpdateToleranceLevelDto): Promise<IUser> {
    const user = await this.findById(id);
    const updated = await this.userRepository.updateById(id, { alcoholToleranceLevel: updateDto.level });
    return updated!;
  }
}
