import type {
  CreateDrinkingSessionInput,
  DrinkingSession,
  SessionParticipant,
  SessionStatus,
} from "../model/types";

const KEY = "ln.drinking_sessions";

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

function id() {
  return `sess_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function list(): DrinkingSession[] {
  return readJson<DrinkingSession[]>(KEY, []);
}

function save(items: DrinkingSession[]) {
  writeJson(KEY, items);
}

function hostId() {
  return "mock-user";
}

function deriveStatus(session: DrinkingSession): SessionStatus {
  if (session.status === "ended" || session.status === "cancelled") {
    return session.status;
  }
  if (session.status === "live") return "live";
  const start = new Date(session.startTime).getTime();
  if (Date.now() >= start) return "live";
  return "scheduled";
}

function normalize(session: DrinkingSession): DrinkingSession {
  const status = deriveStatus(session);
  return status === session.status ? session : { ...session, status };
}

export const sessionMockStore = {
  list(): DrinkingSession[] {
    const items = list().map(normalize);
    save(items);
    return items.sort((a, b) =>
      b.startTime.localeCompare(a.startTime),
    );
  },

  getById(sessionId: string): DrinkingSession | null {
    const found = list().find((s) => s.id === sessionId);
    if (!found) return null;
    const normalized = normalize(found);
    if (normalized !== found) {
      save(list().map((s) => (s.id === sessionId ? normalized : s)));
    }
    return normalized;
  },

  create(input: CreateDrinkingSessionInput): DrinkingSession {
    const participants: SessionParticipant[] = [
      {
        userId: hostId(),
        name: "Bạn (Host)",
        status: "accepted",
      },
      ...(input.inviteeIds ?? []).map((uid) => ({
        userId: uid,
        name: uid.replace(/^u-/, "").replace(/-/g, " "),
        status: "invited" as const,
      })),
    ];

    const session: DrinkingSession = {
      id: id(),
      hostId: hostId(),
      hostName: "Bạn",
      title: input.title.trim(),
      location: input.location.trim(),
      note: input.note?.trim(),
      maxParticipants: input.maxParticipants,
      status: "scheduled",
      startTime: input.startTime,
      startedAt: null,
      endedAt: null,
      participants,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const items = list();
    items.unshift(session);
    save(items);
    return session;
  },

  invite(sessionId: string, userIds: string[]): DrinkingSession {
    const items = list();
    const idx = items.findIndex((s) => s.id === sessionId);
    if (idx < 0) throw new Error("Session not found");
    const session = items[idx]!;
    const existing = new Set(session.participants.map((p) => p.userId));
    const added: SessionParticipant[] = userIds
      .filter((uid) => !existing.has(uid))
      .map((uid) => ({
        userId: uid,
        name: uid.replace(/^u-/, "").replace(/-/g, " "),
        status: "invited" as const,
      }));
    const next: DrinkingSession = {
      ...session,
      participants: [...session.participants, ...added],
      updatedAt: nowIso(),
    };
    items[idx] = next;
    save(items);
    return next;
  },

  checkIn(sessionId: string, userId = hostId()): DrinkingSession {
    const items = list();
    const idx = items.findIndex((s) => s.id === sessionId);
    if (idx < 0) throw new Error("Session not found");
    let session = normalize(items[idx]!);
    session = {
      ...session,
      status: session.status === "scheduled" ? "live" : session.status,
      startedAt: session.startedAt ?? nowIso(),
      participants: session.participants.map((p) =>
        p.userId === userId
          ? { ...p, status: "checked_in", checkedInAt: nowIso() }
          : p,
      ),
      updatedAt: nowIso(),
    };
    items[idx] = session;
    save(items);
    return session;
  },

  end(
    sessionId: string,
    _rating?: number,
    _comment?: string,
  ): DrinkingSession {
    const items = list();
    const idx = items.findIndex((s) => s.id === sessionId);
    if (idx < 0) throw new Error("Session not found");
    const session: DrinkingSession = {
      ...items[idx]!,
      status: "ended",
      endedAt: nowIso(),
      updatedAt: nowIso(),
    };
    items[idx] = session;
    save(items);
    return session;
  },

  cancel(sessionId: string): DrinkingSession {
    const items = list();
    const idx = items.findIndex((s) => s.id === sessionId);
    if (idx < 0) throw new Error("Session not found");
    const session: DrinkingSession = {
      ...items[idx]!,
      status: "cancelled",
      endedAt: nowIso(),
      updatedAt: nowIso(),
    };
    items[idx] = session;
    save(items);
    return session;
  },

  ensureSeed() {
    if (list().length > 0) return;
    const soon = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const later = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.create({
      title: "Bàn tối Q1",
      location: "Nguyễn Huệ, Q1",
      maxParticipants: 6,
      startTime: soon,
      note: "Networking nhẹ",
      inviteeIds: ["u-minh", "u-ha"],
    });
    this.create({
      title: "Tâm sự cuối tuần",
      location: "Thảo Điền",
      maxParticipants: 4,
      startTime: later,
      inviteeIds: ["u-lan"],
    });
  },
};
