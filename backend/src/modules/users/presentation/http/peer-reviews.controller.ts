import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePeerReviewUseCase } from '../../application/use-cases/create-peer-review.use-case';
import { GetReviewsForUserUseCase } from '../../application/use-cases/get-reviews-for-user.use-case';
import { CreatePeerReviewBodyDto } from '../dtos/peer-review-request.dto';
import { PeerReviewResponseDto } from '../dtos/peer-review-response.dto';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Peer Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('users/:id/reviews')
@UseGuards(JwtAuthGuard)
export class PeerReviewsController {
  constructor(
    private readonly createPeerReviewUseCase: CreatePeerReviewUseCase,
    private readonly getReviewsForUserUseCase: GetReviewsForUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a peer review for a user after a session' })
  async createReview(
    @Param('id') revieweeId: string,
    @CurrentUser('id') reviewerId: string,
    @Body() createDto: CreatePeerReviewBodyDto,
  ) {
    const review = await this.createPeerReviewUseCase.execute(reviewerId, {
      ...createDto,
      revieweeId,
    });
    return new PeerReviewResponseDto(review);
  }

  @Get()
  @ApiOperation({
    summary: 'List reviews for a user (respects hideProfile privacy)',
  })
  async getReviewsForUser(
    @Param('id') userId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    const reviews = await this.getReviewsForUserUseCase.execute(
      userId,
      requesterId,
    );
    return reviews.map((review) => new PeerReviewResponseDto(review));
  }
}
