import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../../shared/database/repositories/base.repository';
import { IPeerReviewRepository } from '../../domain/repositories/peer-review.repository.interface';
import { PeerReview, PeerReviewDocument } from '../schemas/peer-review.schema';

@Injectable()
export class PeerReviewRepository extends BaseRepository<PeerReviewDocument> implements IPeerReviewRepository {
  constructor(@InjectModel(PeerReview.name) peerReviewModel: Model<PeerReviewDocument>) {
    super(peerReviewModel);
  }
}
