import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

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
