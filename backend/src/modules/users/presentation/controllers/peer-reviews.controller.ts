import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { PeerReviewsService } from '../../application/services/peer-reviews.service';
import { CreatePeerReviewDto } from '../../application/dtos/peer-review.dto';

// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('users/:id/reviews')
// @UseGuards(JwtAuthGuard)
export class PeerReviewsController {
  constructor(private readonly peerReviewsService: PeerReviewsService) {}

  @Post()
  async createReview(
    @Param('id') revieweeId: string,
    @Request() req: any,
    @Body() createDto: Omit<CreatePeerReviewDto, 'revieweeId'>
  ) {
    const reviewerId = req.user?.id || 'mock-reviewer-id';
    return this.peerReviewsService.createReview(reviewerId, {
      ...createDto,
      revieweeId,
    });
  }

  @Get()
  async getReviewsForUser(@Param('id') userId: string) {
    return this.peerReviewsService.getReviewsForUser(userId);
  }
}
