import { Injectable, Inject } from '@nestjs/common';
import { IPeerReviewRepository } from '../../domain/repositories/peer-review.repository.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreatePeerReviewDto } from '../dtos/peer-review.dto';
import { IPeerReview } from '../../domain/interfaces/peer-review.interface';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';

@Injectable()
export class PeerReviewsService {
  constructor(
    @Inject('IPeerReviewRepository')
    private readonly peerReviewRepository: IPeerReviewRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async createReview(reviewerId: string, createDto: CreatePeerReviewDto): Promise<IPeerReview> {
    if (reviewerId === createDto.revieweeId) {
      throw new ConflictException('You cannot review yourself');
    }

    const reviewee = await this.userRepository.findById(createDto.revieweeId);
    if (!reviewee) {
      throw new NotFoundException('Reviewee not found');
    }

    // Check if review already exists for this session
    const existingReview = await this.peerReviewRepository.findOne({
      reviewerId,
      revieweeId: createDto.revieweeId,
      sessionId: createDto.sessionId,
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this user for this session');
    }

    const review = await this.peerReviewRepository.create({
      reviewerId,
      ...createDto,
    });

    // Update reviewee's average rating
    await this.updateUserAverageRating(createDto.revieweeId);

    return review;
  }

  async getReviewsForUser(userId: string): Promise<IPeerReview[]> {
    return this.peerReviewRepository.findAll({ revieweeId: userId });
  }

  private async updateUserAverageRating(userId: string): Promise<void> {
    const reviews = await this.peerReviewRepository.findAll({ revieweeId: userId });
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.userRepository.updateById(userId, {
      averageRating: Number(averageRating.toFixed(2)),
      totalReviews: reviews.length,
    });
  }
}
