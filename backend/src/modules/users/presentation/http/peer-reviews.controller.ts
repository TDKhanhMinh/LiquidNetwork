import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CreatePeerReviewUseCase } from '../../application/use-cases/create-peer-review.use-case';
import { GetReviewsForUserUseCase } from '../../application/use-cases/get-reviews-for-user.use-case';
import { CreatePeerReviewDto } from '../dtos/peer-review-request.dto';
import { PeerReviewResponseDto } from '../dtos/peer-review-response.dto';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

@Controller('users/:id/reviews')
@UseGuards(JwtAuthGuard)
export class PeerReviewsController {
  constructor(
    private readonly createPeerReviewUseCase: CreatePeerReviewUseCase,
    private readonly getReviewsForUserUseCase: GetReviewsForUserUseCase,
  ) {}

  @Post()
  async createReview(
    @Param('id') revieweeId: string,
    @Request() req: any,
    @Body() createDto: Omit<CreatePeerReviewDto, 'revieweeId'>
  ) {
    const reviewerId = req.user.id;
    const review = await this.createPeerReviewUseCase.execute(reviewerId, {
      ...createDto,
      revieweeId,
    });
    return new PeerReviewResponseDto(review);
  }

  @Get()
  async getReviewsForUser(@Param('id') userId: string) {
    const reviews = await this.getReviewsForUserUseCase.execute(userId);
    return reviews.map(review => new PeerReviewResponseDto(review));
  }
}
