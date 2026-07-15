import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { ExceptionResponse } from '../../shared/common/filters/exception-response.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to the application', description: 'Authenticates a user and returns a JWT token.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1...',
          user: { id: '60d5ecb8b392d7...', email: 'user@drunksocial.com' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
    schema: {
      example: {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
        timestamp: '2026-07-15T11:00:00.000Z',
        path: '/api/auth/login',
      } as ExceptionResponse,
    },
  })
  async login(@Body() loginDto: LoginDto) {
    // This is an example controller
    return { success: true, data: { accessToken: 'mock-token', user: { email: loginDto.email } } };
  }
}
