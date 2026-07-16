import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateBasicInfoUseCase } from '../../application/use-cases/update-basic-info.use-case';
import { UpdateDrunkProfileUseCase } from '../../application/use-cases/update-drunk-profile.use-case';
import { UpdatePrivacySettingsUseCase } from '../../application/use-cases/update-privacy-settings.use-case';
import { UpdateToleranceLevelUseCase } from '../../application/use-cases/update-tolerance-level.use-case';
import {
  UpdateDrunkProfileDto,
  UpdatePrivacySettingsDto,
  UpdateToleranceLevelDto,
  UpdateUserDto,
} from '../dtos/user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateBasicInfoUseCase: UpdateBasicInfoUseCase,
    private readonly updateDrunkProfileUseCase: UpdateDrunkProfileUseCase,
    private readonly updatePrivacySettingsUseCase: UpdatePrivacySettingsUseCase,
    private readonly updateToleranceLevelUseCase: UpdateToleranceLevelUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    const user = await this.findUserByIdUseCase.execute(userId);
    return new UserResponseDto(user, { isOwner: true, includeLevel: true });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update basic profile fields' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    const user = await this.updateBasicInfoUseCase.execute(userId, updateDto);
    return new UserResponseDto(user, { isOwner: true, includeLevel: true });
  }

  @Patch('me/drunk-profile')
  @ApiOperation({ summary: 'Update LiquidNetwork profile section' })
  async updateMyDrunkProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateDrunkProfileDto,
  ) {
    const user = await this.updateDrunkProfileUseCase.execute(userId, updateDto);
    return new UserResponseDto(user, { isOwner: true, includeLevel: true });
  }

  @Patch('me/privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  async updateMyPrivacySettings(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdatePrivacySettingsDto,
  ) {
    const user = await this.updatePrivacySettingsUseCase.execute(
      userId,
      updateDto,
    );
    return new UserResponseDto(user, { isOwner: true, includeLevel: true });
  }

  @Patch('me/tolerance-level')
  @ApiOperation({ summary: 'Update alcohol tolerance level' })
  async updateMyToleranceLevel(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateToleranceLevelDto,
  ) {
    const user = await this.updateToleranceLevelUseCase.execute(
      userId,
      updateDto,
    );
    return new UserResponseDto(user, { isOwner: true, includeLevel: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by id (respects privacy)' })
  async getUserProfile(
    @Param('id') id: string,
    @CurrentUser('id') requesterId: string,
  ) {
    const { user, isOwner, includeLevel } =
      await this.getUserProfileUseCase.execute(id, requesterId);
    return new UserResponseDto(user, { isOwner, includeLevel });
  }
}
