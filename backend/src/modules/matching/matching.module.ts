import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import {
  MatchingPreference,
  MatchingPreferenceSchema,
} from './infrastructure/persistence/schemas/matching-preference.schema';
import {
  MatchingHistory,
  MatchingHistorySchema,
} from './infrastructure/persistence/schemas/matching-history.schema';
import { MatchingPreferenceMongooseRepository } from './infrastructure/persistence/repositories/matching-preference.mongoose.repository';
import { MatchingHistoryMongooseRepository } from './infrastructure/persistence/repositories/matching-history.mongoose.repository';
import { CompatibilityScoringService } from './application/services/compatibility-scoring.service';
import { GenerateCandidateListUseCase } from './application/use-cases/generate-candidate-list.use-case';
import { CalculateCompatibilityScoreUseCase } from './application/use-cases/calculate-compatibility-score.use-case';
import { GetMatchingPreferencesUseCase } from './application/use-cases/get-matching-preferences.use-case';
import { UpdateMatchingPreferencesUseCase } from './application/use-cases/update-matching-preferences.use-case';
import { RecordMatchingHistoryUseCase } from './application/use-cases/record-matching-history.use-case';
import { MatchingController } from './presentation/http/matching.controller';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: MatchingPreference.name, schema: MatchingPreferenceSchema },
      { name: MatchingHistory.name, schema: MatchingHistorySchema },
    ]),
  ],
  controllers: [MatchingController],
  providers: [
    {
      provide: 'IMatchingPreferenceRepository',
      useClass: MatchingPreferenceMongooseRepository,
    },
    {
      provide: 'IMatchingHistoryRepository',
      useClass: MatchingHistoryMongooseRepository,
    },
    CompatibilityScoringService,
    GenerateCandidateListUseCase,
    CalculateCompatibilityScoreUseCase,
    GetMatchingPreferencesUseCase,
    UpdateMatchingPreferencesUseCase,
    RecordMatchingHistoryUseCase,
  ],
  exports: [GenerateCandidateListUseCase, CompatibilityScoringService],
})
export class MatchingModule {}
