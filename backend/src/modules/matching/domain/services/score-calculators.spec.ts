import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';
import {
  computeActivityScore,
  computeCompatibilityScore,
  computeLevelScore,
  computeOccupationScore,
  computeReputationScore,
} from './score-calculators';

describe('score-calculators', () => {
  describe('computeLevelScore', () => {
    it('returns 1 for same level', () => {
      expect(
        computeLevelScore(
          AlcoholToleranceLevel.LEVEL_2,
          AlcoholToleranceLevel.LEVEL_2,
        ),
      ).toBe(1);
    });

    it('returns ~0.67 for one step gap', () => {
      expect(
        computeLevelScore(
          AlcoholToleranceLevel.LEVEL_1,
          AlcoholToleranceLevel.LEVEL_2,
        ),
      ).toBeCloseTo(2 / 3, 5);
    });

    it('returns 0 for max gap', () => {
      expect(
        computeLevelScore(
          AlcoholToleranceLevel.LEVEL_1,
          AlcoholToleranceLevel.LEVEL_4,
        ),
      ).toBe(0);
    });
  });

  describe('computeReputationScore', () => {
    it('returns neutral 0.5 with zero reviews', () => {
      expect(computeReputationScore(5, 0)).toBe(0.5);
    });

    it('uses full rating weight with enough reviews', () => {
      expect(computeReputationScore(4, 3)).toBeCloseTo(0.8, 5);
    });

    it('damps high rating with few reviews', () => {
      const damped = computeReputationScore(5, 1);
      expect(damped).toBeLessThan(1);
      expect(damped).toBeGreaterThan(0.5);
    });
  });

  describe('computeActivityScore', () => {
    const now = new Date('2026-07-16T12:00:00.000Z');

    it('returns 1 for recent activity', () => {
      const updatedAt = new Date('2026-07-15T12:00:00.000Z');
      expect(computeActivityScore(updatedAt, now)).toBe(1);
    });

    it('returns 0 for stale activity', () => {
      const updatedAt = new Date('2026-05-01T12:00:00.000Z');
      expect(computeActivityScore(updatedAt, now)).toBe(0);
    });

    it('returns partial score in the middle of decay window', () => {
      const updatedAt = new Date('2026-07-01T12:00:00.000Z');
      const score = computeActivityScore(updatedAt, now);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });
  });

  describe('computeOccupationScore', () => {
    it('returns 1 when no preferred occupations', () => {
      expect(
        computeOccupationScore(MatchingMode.NETWORKING, [], 'Engineer'),
      ).toBe(1);
    });

    it('returns 1 for non-NETWORKING even with preferred occupations', () => {
      expect(
        computeOccupationScore(
          MatchingMode.CASUAL,
          ['lawyer'],
          'Software Engineer',
        ),
      ).toBe(1);
    });

    it('returns 1 on occupation hit (NETWORKING)', () => {
      expect(
        computeOccupationScore(
          MatchingMode.NETWORKING,
          ['dev', 'engineer'],
          'Software Engineer',
        ),
      ).toBe(1);
    });

    it('returns low score on miss (NETWORKING)', () => {
      expect(
        computeOccupationScore(
          MatchingMode.NETWORKING,
          ['lawyer'],
          'Software Engineer',
        ),
      ).toBe(0.25);
    });

    it('returns low score when candidate has no occupation (NETWORKING)', () => {
      expect(
        computeOccupationScore(MatchingMode.NETWORKING, ['dev'], null),
      ).toBe(0.2);
    });
  });

  describe('computeCompatibilityScore', () => {
    it('scores perfect match higher than poor match', () => {
      const good = computeCompatibilityScore({
        requesterLevel: AlcoholToleranceLevel.LEVEL_3,
        candidateLevel: AlcoholToleranceLevel.LEVEL_3,
        candidateAverageRating: 5,
        candidateTotalReviews: 10,
        candidateUpdatedAt: new Date(),
        mode: MatchingMode.CASUAL,
        preferredOccupations: [],
        candidateOccupation: 'Dev',
      });

      const poor = computeCompatibilityScore({
        requesterLevel: AlcoholToleranceLevel.LEVEL_3,
        candidateLevel: AlcoholToleranceLevel.LEVEL_1,
        candidateAverageRating: 1,
        candidateTotalReviews: 10,
        candidateUpdatedAt: new Date('2020-01-01'),
        mode: MatchingMode.NETWORKING,
        preferredOccupations: ['finance'],
        candidateOccupation: 'Chef',
      });

      expect(good.score).toBeGreaterThan(poor.score);
      expect(good.score).toBeGreaterThanOrEqual(80);
      expect(poor.score).toBeLessThan(60);
    });
  });
});
