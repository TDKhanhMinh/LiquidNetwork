import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MAX_QUEUE_INVITEES } from '../../domain/constants/queue.constants';

export class CreateQueueRequestDto {
  @ApiPropertyOptional({ example: 'Tối nay bàn Sài Gòn' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ example: 'Ai rảnh đi 1–2 tiếng không?' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({
    example: 60,
    description: 'Per-invitee response window in seconds (15–600)',
  })
  @IsInt()
  @Min(15)
  @Max(600)
  timeoutSeconds: number;

  @ApiProperty({
    type: [String],
    example: ['64f0a1b2c3d4e5f678901234'],
    description: 'Ordered invitee user ids (priority high → low), max 20',
    maxItems: MAX_QUEUE_INVITEES,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_QUEUE_INVITEES)
  @IsMongoId({ each: true })
  inviteeIds: string[];
}
