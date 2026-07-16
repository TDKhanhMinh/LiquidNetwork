import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RespondQueueRequestDto {
  @ApiProperty({
    example: true,
    description: 'true = accept, false = reject',
  })
  @IsBoolean()
  accept: boolean;
}
