import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateBasicInfoUseCase } from '../../application/use-cases/update-basic-info.use-case';
import { UpdateDrunkProfileUseCase } from '../../application/use-cases/update-drunk-profile.use-case';
import { UpdatePrivacySettingsUseCase } from '../../application/use-cases/update-privacy-settings.use-case';
import { UpdateToleranceLevelUseCase } from '../../application/use-cases/update-tolerance-level.use-case';
import {
  UpdateDrunkProfileDto,
  UpdatePrivacySettingsDto,
  UpdateToleranceLevelDto,
  UpdateUserDto
} from '../dtos/user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateBasicInfoUseCase: UpdateBasicInfoUseCase,
    private readonly updateDrunkProfileUseCase: UpdateDrunkProfileUseCase,
    private readonly updatePrivacySettingsUseCase: UpdatePrivacySettingsUseCase,
    private readonly updateToleranceLevelUseCase: UpdateToleranceLevelUseCase,
  ) {}

  @Get('me')
  async getMyProfile(@Request() req: any) {
    const userId = req.user.id;
    const user = await this.findUserByIdUseCase.execute(userId);
    return new UserResponseDto(user);
  }

  @Patch('me')
  async updateMyProfile(@Request() req: any, @Body() updateDto: UpdateUserDto) {
    const userId = req.user.id;
    const user = await this.updateBasicInfoUseCase.execute(userId, updateDto);
    return new UserResponseDto(user);
  }

  @Patch('me/drunk-profile')
  async updateMyDrunkProfile(@Request() req: any, @Body() updateDto: UpdateDrunkProfileDto) {
    const userId = req.user.id;
    const user = await this.updateDrunkProfileUseCase.execute(userId, updateDto);
    return new UserResponseDto(user);
  }

  @Patch('me/privacy')
  async updateMyPrivacySettings(@Request() req: any, @Body() updateDto: UpdatePrivacySettingsDto) {
    const userId = req.user.id;
    const user = await this.updatePrivacySettingsUseCase.execute(userId, updateDto);
    return new UserResponseDto(user);
  }

  @Patch('me/tolerance-level')
  async updateMyToleranceLevel(@Request() req: any, @Body() updateDto: UpdateToleranceLevelDto) {
    const userId = req.user.id;
    const user = await this.updateToleranceLevelUseCase.execute(userId, updateDto);
    return new UserResponseDto(user);
  }

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    // In a real app, this would check the target user's privacy settings before returning
    const user = await this.findUserByIdUseCase.execute(id);
    return new UserResponseDto(user);
  }
}
