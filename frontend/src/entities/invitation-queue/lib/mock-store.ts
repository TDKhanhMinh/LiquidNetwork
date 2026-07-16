import type {
  CreateQueueInput,
  Invitation,
  InvitationQueue,
  QueueParticipant,
  QueueUserRef,
} from "../model/types";

const QUEUES_KEY = "ln.invitation_queues";
const INVITES_KEY = "ln.invitations";
const EVENT = "ln-queue-changed";

export const DEMO_CANDIDATES: QueueUserRef[] = [
  {
    id: "u-minh",
    name: "Minh Bia",
    alcoholToleranceLevel: "LEVEL_2",
    occupation: "Sales",
  },
  {
    id: "u-lan",
    name: "Lan Chill",
    alcoholToleranceLevel: "LEVEL_1",
    occupation: "Designer",
  },
  {
    id: "u-huy",
    name: "Huy Chiến",
    alcoholToleranceLevel: "LEVEL_3",
    occupation: "Engineer",
  },
  {
    id: "u-trang",
    name: "Trang Debater",
    alcoholToleranceLevel: "LEVEL_2",
    occupation: "Lawyer",
  },
  {
    id: "u-phong",
    name: "Phong Trần",
    alcoholToleranceLevel: "LEVEL_4",
    occupation: "Founder",
  },
  {
    id: "u-ha",
    name: "Hà Networking",
    alcoholToleranceLevel: "LEVEL_2",
    occupation: "HR",
  },
  {
    id: "u-duc",
    name: "Đức Tài",
    alcoholToleranceLevel: "LEVEL_1",
    occupation: "Teacher",
  },
  {
    id: "u-vy",
    name: "Vy Vui Vẻ",
    alcoholToleranceLevel: "LEVEL_3",
    occupation: "Marketer",
  },
];

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
  notifyQueueStoreChanged();
}

export function notifyQueueStoreChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeQueueStore(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function listQueues(): InvitationQueue[] {
  return readJson<InvitationQueue[]>(QUEUES_KEY, []);
}

function saveQueues(queues: InvitationQueue[]) {
  writeJson(QUEUES_KEY, queues);
}

function listInvitations(): Invitation[] {
  return readJson<Invitation[]>(INVITES_KEY, []);
}

function saveInvitations(items: Invitation[]) {
  writeJson(INVITES_KEY, items);
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function applyTimeouts(queue: InvitationQueue): InvitationQueue {
  if (queue.status !== "active" || !queue.expiresAt) return queue;
  if (new Date(queue.expiresAt).getTime() > Date.now()) return queue;

  const participants = queue.participants.map((p, i) => {
    if (i === queue.currentIndex && p.status === "active") {
      return {
        ...p,
        status: "timeout" as const,
        respondedAt: nowIso(),
      };
    }
    return p;
  });

  return advanceQueue({ ...queue, participants });
}

function advanceQueue(queue: InvitationQueue): InvitationQueue {
  const nextIndex = queue.participants.findIndex(
    (p, i) => i > queue.currentIndex && p.status === "pending",
  );

  if (nextIndex === -1) {
    const anyAccepted = queue.participants.some((p) => p.status === "accepted");
    return {
      ...queue,
      status: anyAccepted ? "matched" : "completed",
      currentIndex: queue.currentIndex,
      expiresAt: null,
      completedAt: nowIso(),
      updatedAt: nowIso(),
      participants: queue.participants,
    };
  }

  const expiresAt = new Date(
    Date.now() + queue.timeoutSeconds * 1000,
  ).toISOString();

  const participants = queue.participants.map((p, i) => {
    if (i === nextIndex) {
      return {
        ...p,
        status: "active" as const,
        invitedAt: nowIso(),
      };
    }
    return p;
  });

  const active = participants[nextIndex]!;
  upsertInvitationFromParticipant(queue, active, "pending", expiresAt);

  return {
    ...queue,
    status: "active",
    currentIndex: nextIndex,
    expiresAt,
    updatedAt: nowIso(),
    participants,
  };
}

function upsertInvitationFromParticipant(
  queue: InvitationQueue,
  participant: QueueParticipant,
  status: Invitation["status"],
  expiresAt: string | null,
) {
  const invites = listInvitations();
  const existingIdx = invites.findIndex(
    (i) => i.queueId === queue.id && i.toUserId === participant.userId,
  );
  const base: Invitation = {
    id:
      existingIdx >= 0
        ? invites[existingIdx]!.id
        : id("inv"),
    queueId: queue.id,
    fromUserId: queue.hostId,
    fromUserName: queue.hostName,
    fromUserAvatar: queue.hostAvatar,
    toUserId: participant.userId,
    toUserName: participant.name,
    toUserAvatar: participant.avatar,
    status,
    message: queue.message,
    timeoutSeconds: queue.timeoutSeconds,
    expiresAt,
    createdAt:
      existingIdx >= 0 ? invites[existingIdx]!.createdAt : nowIso(),
    respondedAt:
      status === "pending" ? null : nowIso(),
  };
  if (existingIdx >= 0) invites[existingIdx] = base;
  else invites.unshift(base);
  saveInvitations(invites);
}

export const queueMockStore = {
  searchCandidates(query: string): QueueUserRef[] {
    const q = query.trim().toLowerCase();
    if (!q) return DEMO_CANDIDATES;
    return DEMO_CANDIDATES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.occupation?.toLowerCase().includes(q) ||
        u.alcoholToleranceLevel?.toLowerCase().includes(q),
    );
  },

  listMyActive(hostId: string): InvitationQueue | null {
    const queues = listQueues()
      .map(applyTimeouts)
      .map((q) => {
        // persist timeout advances
        return q;
      });

    // Write back if timeouts applied
    const raw = listQueues();
    const next = raw.map((q) => {
      const updated = applyTimeouts(q);
      return updated;
    });
    if (JSON.stringify(raw) !== JSON.stringify(next)) {
      saveQueues(next);
    }

    return (
      next.find((q) => q.hostId === hostId && q.status === "active") ?? null
    );
  },

  getById(queueId: string): InvitationQueue | null {
    const queues = listQueues();
    const found = queues.find((q) => q.id === queueId);
    if (!found) return null;
    const updated = applyTimeouts(found);
    if (updated !== found && JSON.stringify(updated) !== JSON.stringify(found)) {
      saveQueues(queues.map((q) => (q.id === queueId ? updated : q)));
    }
    return updated;
  },

  create(
    host: QueueUserRef,
    input: CreateQueueInput,
  ): InvitationQueue {
    const invitees =
      input.invitees ??
      input.inviteeIds.map((uid) => {
        const found = DEMO_CANDIDATES.find((c) => c.id === uid);
        return (
          found ?? {
            id: uid,
            name: uid,
          }
        );
      });

    if (invitees.length === 0) {
      throw new Error("At least one invitee is required");
    }

    const timeoutSeconds = Math.min(
      600,
      Math.max(15, input.timeoutSeconds || 60),
    );
    const expiresAt = new Date(Date.now() + timeoutSeconds * 1000).toISOString();

    const participants: QueueParticipant[] = invitees.map((u, order) => ({
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      order,
      status: order === 0 ? "active" : "pending",
      invitedAt: order === 0 ? nowIso() : null,
      respondedAt: null,
    }));

    const queue: InvitationQueue = {
      id: id("q"),
      hostId: host.id,
      hostName: host.name,
      hostAvatar: host.avatar,
      title: input.title?.trim() || `Mời giao lưu · ${host.name}`,
      message: input.message?.trim() || "",
      status: "active",
      timeoutSeconds,
      currentIndex: 0,
      participants,
      expiresAt,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    };

    const queues = listQueues();
    queues.unshift(queue);
    saveQueues(queues);

    upsertInvitationFromParticipant(queue, participants[0]!, "pending", expiresAt);

    return queue;
  },

  respond(queueId: string, userId: string, accept: boolean): InvitationQueue {
    const queues = listQueues();
    const idx = queues.findIndex((q) => q.id === queueId);
    if (idx < 0) throw new Error("Queue not found");

    let queue = applyTimeouts(queues[idx]!);
    if (queue.status !== "active") {
      throw new Error("Queue is not active");
    }

    const current = queue.participants[queue.currentIndex];
    if (!current || current.userId !== userId || current.status !== "active") {
      throw new Error("You are not the current invitee");
    }

    const participants = queue.participants.map((p, i) => {
      if (i !== queue.currentIndex) return p;
      return {
        ...p,
        status: accept ? ("accepted" as const) : ("rejected" as const),
        respondedAt: nowIso(),
      };
    });

    queue = { ...queue, participants, updatedAt: nowIso() };
    upsertInvitationFromParticipant(
      queue,
      participants[queue.currentIndex]!,
      accept ? "accepted" : "rejected",
      null,
    );

    if (accept) {
      queue = {
        ...queue,
        status: "matched",
        expiresAt: null,
        completedAt: nowIso(),
      };
    } else {
      queue = advanceQueue(queue);
    }

    queues[idx] = queue;
    saveQueues(queues);
    return queue;
  },

  cancel(queueId: string, hostId: string): InvitationQueue {
    const queues = listQueues();
    const idx = queues.findIndex((q) => q.id === queueId);
    if (idx < 0) throw new Error("Queue not found");
    const queue = queues[idx]!;
    if (queue.hostId !== hostId) throw new Error("Only host can cancel");

    const updated: InvitationQueue = {
      ...queue,
      status: "cancelled",
      expiresAt: null,
      completedAt: nowIso(),
      updatedAt: nowIso(),
      participants: queue.participants.map((p) =>
        p.status === "pending" || p.status === "active"
          ? { ...p, status: "skipped" as const }
          : p,
      ),
    };
    queues[idx] = updated;
    saveQueues(queues);

    const invites = listInvitations().map((inv) =>
      inv.queueId === queueId && inv.status === "pending"
        ? { ...inv, status: "cancelled" as const, respondedAt: nowIso() }
        : inv,
    );
    saveInvitations(invites);
    return updated;
  },

  history(userId: string): { sent: Invitation[]; received: Invitation[] } {
    // Ensure timeouts processed
    listQueues().forEach((q) => queueMockStore.getById(q.id));

    const invites = listInvitations();
    return {
      sent: invites.filter((i) => i.fromUserId === userId),
      received: invites.filter((i) => i.toUserId === userId),
    };
  },

  getInvitation(invitationId: string): Invitation | null {
    return listInvitations().find((i) => i.id === invitationId) ?? null;
  },

  /** Seed a received invite for demo when history is empty */
  ensureDemoReceived(userId: string) {
    const { received } = this.history(userId);
    if (received.length > 0) return;
    const host = DEMO_CANDIDATES[0]!;
    const expiresAt = new Date(Date.now() + 90_000).toISOString();
    const inv: Invitation = {
      id: id("inv"),
      queueId: id("q"),
      fromUserId: host.id,
      fromUserName: host.name,
      toUserId: userId,
      toUserName: "Bạn",
      status: "pending",
      message: "Tối nay bàn Sài Gòn — join không?",
      timeoutSeconds: 90,
      expiresAt,
      createdAt: nowIso(),
    };
    const invites = listInvitations();
    invites.unshift(inv);
    saveInvitations(invites);
  },
};
