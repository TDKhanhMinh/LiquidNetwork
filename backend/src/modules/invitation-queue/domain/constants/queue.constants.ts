/** Max invitees per sequential queue (abuse / load guard) */
export const MAX_QUEUE_INVITEES = 20;

/** Create queue: max attempts per rolling window */
export const CREATE_QUEUE_THROTTLE_LIMIT = 10;
/** Create queue window (ms) — 1 hour */
export const CREATE_QUEUE_THROTTLE_TTL_MS = 60 * 60 * 1000;

/** Respond: max attempts per rolling window */
export const RESPOND_QUEUE_THROTTLE_LIMIT = 30;
/** Respond window (ms) — 1 minute */
export const RESPOND_QUEUE_THROTTLE_TTL_MS = 60 * 1000;
