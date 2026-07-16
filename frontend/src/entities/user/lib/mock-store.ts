import type {
  DrunkProfile,
  PrivacySettings,
  UpdateDrunkProfilePayload,
  UpdateToleranceLevelPayload,
  UpdateUserPayload,
  User,
} from "../model/types";

const USER_KEY = "ln.user_profile";

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

function defaultUser(): User {
  return {
    id: "mock-user",
    name: "Người dùng",
    email: "ban@liquid.network",
    phone: "",
    bio: "",
    drunkProfile: {
      occupation: "",
      education: "",
      selfIntroduction: "",
    },
    alcoholToleranceLevel: "LEVEL_2",
    privacySettings: {
      hideProfile: false,
      hideLevel: false,
    },
    sessionsJoined: 3,
    invitationAcceptRate: 72,
    averageRating: 4.2,
    totalReviews: 2,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function ensureUser(): User {
  const existing = readJson<User | null>(USER_KEY, null);
  if (existing) return existing;
  const user = defaultUser();
  writeJson(USER_KEY, user);
  return user;
}

function saveUser(user: User) {
  writeJson(USER_KEY, { ...user, updatedAt: nowIso() });
}

export const userMockStore = {
  getMe(): User {
    return ensureUser();
  },

  getById(id: string): User {
    const me = ensureUser();
    if (id === me.id || id === "me") return me;

    const pretty = id.startsWith("u-")
      ? id
          .replace(/^u-/, "")
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : `User ${id.slice(0, 6)}`;

    return {
      id,
      name: pretty,
      bio: "Thành viên LiquidNetwork",
      drunkProfile: {
        occupation: "Đang cập nhật",
        education: "",
        selfIntroduction: "Thích bàn vui, đúng giờ, không ép bia.",
      },
      alcoholToleranceLevel: "LEVEL_2",
      privacySettings: { hideProfile: false, hideLevel: false },
      sessionsJoined: 5,
      invitationAcceptRate: 60,
      averageRating: 4.0,
      totalReviews: 2,
    };
  },

  updateMe(payload: UpdateUserPayload): User {
    const me = ensureUser();
    const next = { ...me, ...payload };
    saveUser(next);
    return next;
  },

  updateDrunkProfile(payload: UpdateDrunkProfilePayload): User {
    const me = ensureUser();
    const next: User = {
      ...me,
      drunkProfile: {
        ...me.drunkProfile,
        ...payload.drunkProfile,
      } as DrunkProfile,
    };
    saveUser(next);
    return next;
  },

  updateTolerance(payload: UpdateToleranceLevelPayload): User {
    const me = ensureUser();
    const next = { ...me, alcoholToleranceLevel: payload.level };
    saveUser(next);
    // Best-effort level history in peer-review mock key
    try {
      const key = `ln.level_history:${me.id}`;
      const history = readJson<
        { id: string; level: string; source: string; note?: string; createdAt: string }[]
      >(key, []);
      history.unshift({
        id: `lv_${Date.now()}`,
        level: payload.level,
        source: "self",
        note: "Tự cập nhật level",
        createdAt: nowIso(),
      });
      writeJson(key, history);
    } catch {
      // ignore
    }
    return next;
  },

  updatePrivacy(privacySettings: Partial<PrivacySettings>): User {
    const me = ensureUser();
    const next: User = {
      ...me,
      privacySettings: {
        hideProfile: false,
        hideLevel: false,
        ...me.privacySettings,
        ...privacySettings,
      },
    };
    saveUser(next);
    return next;
  },
};
