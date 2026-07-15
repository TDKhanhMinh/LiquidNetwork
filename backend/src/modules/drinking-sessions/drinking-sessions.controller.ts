import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDrinkingSessionDto } from './dto/create-drinking-session.dto';
import { ExceptionResponse } from '../../shared/common/filters/exception-response.interface';

@ApiTags('Drinking Sessions')
@Controller('drinking-sessions')
@ApiBearerAuth('JWT-auth') // Protect all endpoints in this controller
export class DrinkingSessionsController {
  @Post()
  @ApiOperation({ summary: 'Create a new drinking session', description: 'Creates a new drinking session and invites participants.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The drinking session has been successfully created.',
    schema: {
      example: {
        success: true,
        data: {
          id: '60d5ecb8b392d7...',
          title: 'Friday Night Beers',
          status: 'SCHEDULED',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed.',
    schema: {
      example: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { errors: ['maxParticipants must not be greater than 20'] },
        },
        timestamp: '2026-07-15T11:00:00.000Z',
        path: '/api/drinking-sessions',
      } as ExceptionResponse,
    },
  })
  async create(@Body() createDto: CreateDrinkingSessionDto) {
    // This is an example controller
    return { success: true, data: { id: 'mock-id', ...createDto, status: 'SCHEDULED' } };
  }
}
