import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

/** Full command shape (internal / docs). */
export class CreatePeerReviewDto {
  @IsString()
  revieweeId: string;

  @IsString()
  sessionId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

/**
 * HTTP body for POST /users/:id/reviews.
 * revieweeId comes from the path param — must be a real class so ValidationPipe runs.
 */
export class CreatePeerReviewBodyDto {
  @ApiProperty({ example: '60d5ecb8b392d7session' })
  @IsString()
  sessionId: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great hangout partner' })
  @IsString()
  @IsOptional()
  comment?: string;
}
