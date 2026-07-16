import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueueUserRef } from '../../application/use-cases/search-candidates.use-case';

export class QueueUserRefDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  alcoholToleranceLevel?: string;

  @ApiPropertyOptional()
  occupation?: string;

  constructor(ref: QueueUserRef) {
    this.id = ref.id;
    this.name = ref.name;
    this.avatar = ref.avatar;
    this.alcoholToleranceLevel = ref.alcoholToleranceLevel;
    this.occupation = ref.occupation;
  }
}
