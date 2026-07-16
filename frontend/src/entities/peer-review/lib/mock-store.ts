import type {
  CreatePeerReviewPayload,
  LevelHistoryEntry,
  PeerReview,
} from "../model/types";

const REVIEWS_KEY = "ln.peer_reviews";
const LEVEL_HISTORY_KEY = "ln.level_history";

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function listReviews(): PeerReview[] {
  return readJson<PeerReview[]>(REVIEWS_KEY, []);
}

function saveReviews(items: PeerReview[]) {
  writeJson(REVIEWS_KEY, items);
}

export const peerReviewMockStore = {
  listForUser(userId: string, seedOwnerId = "mock-user"): PeerReview[] {
    let reviews = listReviews().filter((r) => r.revieweeId === userId);

    if (reviews.length === 0 && userId === seedOwnerId) {
      reviews = [
        {
          id: id("rv"),
          reviewerId: "u-minh",
          reviewerName: "Minh Bia",
          revieweeId: userId,
          sessionId: "sess_demo_1",
          rating: 5,
          comment: "Vui, đúng hẹn, không ép bia — 10/10.",
          createdAt: nowIso(),
        },
        {
          id: id("rv"),
          reviewerId: "u-lan",
          reviewerName: "Lan Chill",
          revieweeId: userId,
          sessionId: "sess_demo_2",
          rating: 4,
          comment: "Tone bàn chill, đáng tin.",
          createdAt: nowIso(),
        },
      ];
      saveReviews([...reviews, ...listReviews()]);
    }

    return reviews.sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  },

  create(
    revieweeId: string,
    reviewerId: string,
    reviewerName: string,
    payload: CreatePeerReviewPayload,
  ): PeerReview {
    const all = listReviews();
    const idx = all.findIndex(
      (r) =>
        r.reviewerId === reviewerId &&
        r.revieweeId === revieweeId &&
        r.sessionId === payload.sessionId,
    );
    const review: PeerReview = {
      id: idx >= 0 ? all[idx]!.id : id("rv"),
      reviewerId,
      reviewerName,
      revieweeId,
      sessionId: payload.sessionId,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: idx >= 0 ? all[idx]!.createdAt : nowIso(),
    };
    if (idx >= 0) all[idx] = review;
    else all.unshift(review);
    saveReviews(all);
    return review;
  },

  levelHistory(
    userId: string,
    currentLevel = "LEVEL_2",
  ): LevelHistoryEntry[] {
    const key = `${LEVEL_HISTORY_KEY}:${userId}`;
    let history = readJson<LevelHistoryEntry[]>(key, []);
    if (history.length === 0) {
      history = [
        {
          id: id("lv"),
          level: currentLevel,
          source: "system",
          note: "Level khởi tạo",
          createdAt: nowIso(),
        },
      ];
      writeJson(key, history);
    }
    return history;
  },

  pushLevelHistory(
    userId: string,
    level: string,
    note = "Tự cập nhật level",
  ): LevelHistoryEntry[] {
    const key = `${LEVEL_HISTORY_KEY}:${userId}`;
    const history = readJson<LevelHistoryEntry[]>(key, []);
    history.unshift({
      id: id("lv"),
      level,
      source: "self",
      note,
      createdAt: nowIso(),
    });
    writeJson(key, history);
    return history;
  },
};
