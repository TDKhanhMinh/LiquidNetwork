/** Align with invitation-queue MAX_QUEUE_INVITEES without importing that module */
export const ABSOLUTE_MAX_CANDIDATES = 20;
export const DEFAULT_MAX_CANDIDATES = ABSOLUTE_MAX_CANDIDATES;

/** Phase 1 weights (no distance). Sum = 1.0 */
export const SCORING_WEIGHTS = {
  level: 0.4,
  mode: 0.2,
  reputation: 0.2,
  activity: 0.1,
  occupation: 0.1,
} as const;

/** Max users loaded from DB before scoring */
export const MATCHING_POOL_LIMIT = 200;

/**
 * If history exclusion shrinks the pool below this ratio of requested limit,
 * retry without history excludes (client excludes still apply).
 */
export const POOL_HISTORY_FALLBACK_RATIO = 0.5;

/** Activity decay: full score if updated within this many days */
export const ACTIVITY_FULL_SCORE_DAYS = 3;
/** Activity score reaches 0 after this many days */
export const ACTIVITY_ZERO_SCORE_DAYS = 30;

/** Below this review count, blend reputation toward neutral 0.5 */
export const REPUTATION_MIN_REVIEWS_FOR_FULL_WEIGHT = 3;

/** Default days to exclude candidates seen in matching history */
export const DEFAULT_EXCLUDE_RECENT_DAYS = 7;

/** Preference defaults */
export const DEFAULT_MAX_DISTANCE_KM = 15;

/** Generate candidates: max attempts per rolling window */
export const GENERATE_CANDIDATES_THROTTLE_LIMIT = 30;
/** Generate window (ms) — 1 minute */
export const GENERATE_CANDIDATES_THROTTLE_TTL_MS = 60 * 1000;

/** Score one pair: max attempts per rolling window */
export const SCORE_PAIR_THROTTLE_LIMIT = 60;
/** Score window (ms) — 1 minute */
export const SCORE_PAIR_THROTTLE_TTL_MS = 60 * 1000;
