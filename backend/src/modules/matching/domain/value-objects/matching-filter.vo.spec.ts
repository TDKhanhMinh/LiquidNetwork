import { AlcoholToleranceLevel } from '../../../users/domain/enums/alcohol-tolerance-level.enum';
import { MatchingMode } from '../enums/matching-mode.enum';
import { resolveMatchingFilter } from './matching-filter.vo';

describe('resolveMatchingFilter', () => {
  it('defaults mode to CASUAL and limit to 20', () => {
    const f = resolveMatchingFilter({});
    expect(f.mode).toBe(MatchingMode.CASUAL);
    expect(f.limit).toBe(20);
    expect(f.excludeRecentDays).toBe(7);
    expect(f.preferredAlcoholLevels).toEqual([]);
  });

  it('prefers request overrides over stored prefs', () => {
    const f = resolveMatchingFilter(
      {
        mode: MatchingMode.DEBATE,
        preferredAlcoholLevels: [AlcoholToleranceLevel.LEVEL_1],
        limit: 5,
        excludeRecentDays: 3,
        preferredOccupations: ['  Dev '],
      },
      {
        preferredModes: [MatchingMode.NETWORKING],
        preferredAlcoholLevels: [AlcoholToleranceLevel.LEVEL_4],
        preferredOccupations: ['lawyer'],
        maxCandidates: 10,
        excludeRecentDays: 14,
      },
    );

    expect(f.mode).toBe(MatchingMode.DEBATE);
    expect(f.preferredAlcoholLevels).toEqual([AlcoholToleranceLevel.LEVEL_1]);
    expect(f.preferredOccupations).toEqual(['Dev']);
    expect(f.limit).toBe(5);
    expect(f.excludeRecentDays).toBe(3);
  });

  it('uses prefs when request fields omitted', () => {
    const f = resolveMatchingFilter(
      {},
      {
        preferredModes: [MatchingMode.NETWORKING, MatchingMode.CASUAL],
        preferredAlcoholLevels: [AlcoholToleranceLevel.LEVEL_2],
        preferredOccupations: ['pm'],
        maxCandidates: 8,
        excludeRecentDays: 2,
      },
    );

    expect(f.mode).toBe(MatchingMode.NETWORKING);
    expect(f.preferredAlcoholLevels).toEqual([AlcoholToleranceLevel.LEVEL_2]);
    expect(f.preferredOccupations).toEqual(['pm']);
    expect(f.limit).toBe(8);
    expect(f.excludeRecentDays).toBe(2);
  });

  it('clamps limit to absolute max 20', () => {
    const f = resolveMatchingFilter({ limit: 999 });
    expect(f.limit).toBe(20);
  });

  it('dedupes excludeUserIds', () => {
    const f = resolveMatchingFilter({
      excludeUserIds: ['a', 'a', 'b'],
    });
    expect(f.excludeUserIds).toEqual(['a', 'b']);
  });
});
