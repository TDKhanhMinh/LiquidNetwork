import { Controller, Get, Patch, Body, Request, UseGuards, Param, Post } from '@nestjs/common';
import { UsersService } from '../../application/services/users.service';
import { 
  UpdateUserDto, 
  UpdateDrunkProfileDto, 
  UpdatePrivacySettingsDto,
  UpdateToleranceLevelDto
} from '../../application/dtos/user.dto';

// Assuming we have an AuthGuard, I'll put a placeholder or basic setup
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('users')
// @UseGuards(JwtAuthGuard) // To be enabled when Auth module is fully integrated
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Request() req: any) {
    // For now, mock the user ID since Auth isn't fully set up in this context.
    // Replace 'mock-user-id' with req.user.id
    const userId = req.user?.id || 'mock-user-id';
    return this.usersService.findById(userId);
  }

  @Patch('me')
  async updateMyProfile(@Request() req: any, @Body() updateDto: UpdateUserDto) {
    const userId = req.user?.id || 'mock-user-id';
    return this.usersService.updateBasicInfo(userId, updateDto);
  }

  @Patch('me/drunk-profile')
  async updateMyDrunkProfile(@Request() req: any, @Body() updateDto: UpdateDrunkProfileDto) {
    const userId = req.user?.id || 'mock-user-id';
    return this.usersService.updateDrunkProfile(userId, updateDto);
  }

  @Patch('me/privacy')
  async updateMyPrivacySettings(@Request() req: any, @Body() updateDto: UpdatePrivacySettingsDto) {
    const userId = req.user?.id || 'mock-user-id';
    return this.usersService.updatePrivacySettings(userId, updateDto);
  }

  @Patch('me/tolerance-level')
  async updateMyToleranceLevel(@Request() req: any, @Body() updateDto: UpdateToleranceLevelDto) {
    const userId = req.user?.id || 'mock-user-id';
    return this.usersService.updateToleranceLevel(userId, updateDto);
  }

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    // In a real app, this would check the target user's privacy settings before returning
    return this.usersService.findById(id);
  }
}
