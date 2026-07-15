import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDrinkingSessionDto {
  @ApiProperty({
    description: 'The title of the drinking session',
    example: 'Friday Night Beers',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'The location of the session',
    example: '123 Nguyen Hue, Q1, HCMC',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed (1 - 20)',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(20)
  maxParticipants!: number;

  @ApiProperty({
    description: 'Scheduled start time for the session',
    example: '2026-07-20T19:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({
    description: 'Optional note about the session',
    example: 'Bring your own snacks',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
