# Feature: Sequential Invitation Queue ★

> Feature **quan trọng nhất** của LiquidNetwork. Agent **bắt buộc** đọc hết file này trước khi implement.

## Mục tiêu sản phẩm

Cho phép host (hoặc hệ thống matchmaking) **mời người theo thứ tự**, mỗi lượt có **timeout**. Không spam mời đồng thời. Backend (NestJS + BullMQ) là nguồn sự thật cho advance/timeout; frontend hiển thị state machine + real-time + thao tác accept/reject.

---

## Thuật ngữ

| Term | Ý nghĩa |
|------|---------|
| **Queue** | Hàng đợi mời gắn session (hoặc context mời) |
| **Head / Current invitee** | Người đang được mời (active slot) |
| **Timeout** | Thời gian tối đa để accept/reject |
| **Advance** | Chuyển sang người tiếp theo (timeout / reject / skip) |
| **Accept** | Đồng ý tham gia session |
| **Reject / Decline** | Từ chối → advance |
| **Waiting** | Đang trong hàng, chưa tới lượt |

---

## Sequence tổng (tạo → chờ → timeout → advance → accept/reject)

```text
[Host/System]          [API/Nest+BullMQ]           [Socket]            [Invitee App]
     | create queue           |                       |                      |
     |----------------------->| set head=#1           |                      |
     |                        | schedule timeout job  |                      |
     |                        |---------------------->| queue.updated        |
     |                        |                       |--------------------->|
     |                        |                       | your-turn (nếu head) |
     |                        |                       |--------------------->|
     |                        |                       |                      | show countdown
     |                        |                       |                      | Accept?
     |                        |<----------------------------------------------| POST accept
     |                        | join session          |                      |
     |                        |---------------------->| advanced/completed   |
     |                        |                       |--------------------->|
     |                        |  --- hoặc timeout --- |                      |
     |                        | job fires             |                      |
     |                        | head → timeout        |                      |
     |                        | advance head=#2       |                      |
     |                        |---------------------->| advanced             |
     |                        |                       |--------------------->| UI position update
```

## User flows đầy đủ

### A. Host tạo / mở queue

```
Host mở Session → “Mời tuần tự” / hệ thống đẩy candidates
  → API tạo queue + danh sách entries (ordered)
  → Backend set current entry = #1, start timeout job (BullMQ)
  → Socket: queue.created / queue.updated → FE subscribe
  → UI Host: danh sách + “Đang mời: @Nam · còn 0:45”
```

### B. Invitee nhận lượt (current)

```
User là head của queue
  → Push notification + socket invitation-queue.your-turn
  → Màn Queue / bottom sheet “Bạn được mời vào bàn X”
  → Countdown endsAt
  → User Accept → API accept → join session → queue completed/partial update
  → User Reject → API reject → advance
  → Hết giờ (không action) → backend timeout → advance → FE nhận event
```

### C. User đang waiting (chưa tới lượt)

```
UI: “Bạn ở vị trí #4 · ước tính ~3 phút”
  → Không hiện nút Accept (hoặc disabled + giải thích)
  → Khi advance tới mình → transition animation + haptic nhẹ + CTA lớn
```

### D. Hết queue / empty

```
Không còn entry pending
  → Host: empty “Chưa có ai trong hàng — thêm bạn bè / mở matchmaking”
  → Invitee đã xong: “Hàng mời đã xong” + CTA về session
```

### E. Lỗi / mất mạng

```
Action fail → toast i18n + giữ state cũ (rollback optimistic)
Socket down → banner reconnect + optional poll
```

---

## State machine (UI ↔ backend)

> Tên status **phải align backend**. Bảng dưới là **canonical FE domain** — map từ DTO.

### Queue-level status

| Status | UI Host | UI Participant |
|--------|---------|----------------|
| `draft` | Setup, chưa chạy | — |
| `active` | Đang mời tuần tự | Theo entry của mình |
| `paused` | Tạm dừng (host) | “Host tạm dừng hàng mời” |
| `completed` | Hoàn tất | “Đã xong” |
| `cancelled` | Đã hủy | “Hàng mời đã hủy” |

### Entry-level status

| Status | Ý nghĩa | UI chính |
|--------|---------|----------|
| `waiting` | Chưa tới lượt | Position badge, ETA |
| `invited` / `pending_response` | Đang là head, chờ phản hồi | Countdown + Accept/Reject |
| `accepted` | Đồng ý | Check xanh, vào session |
| `rejected` | Từ chối | Gạch nhẹ / ẩn CTA |
| `timeout` | Hết giờ không trả lời | “Hết giờ” + advance note |
| `skipped` | Host skip | “Đã bỏ qua” |
| `expired` | Queue hủy khi còn waiting | Disabled |

### Transition (logic backend; FE chỉ phản ánh)

```
waiting → invited (khi thành head)
invited → accepted | rejected | timeout | skipped
* → (queue cancelled) expired
```

**FE không** tự chuyển `invited → timeout` trừ khi countdown local UX; **source of truth** vẫn event/API. Countdown về 0: show “Đang cập nhật…” cho tới socket/API confirm.

---

## Data model (domain FE)

```ts
type InvitationQueue = {
  id: string;
  sessionId: string;
  status: QueueStatus;
  currentEntryId: string | null;
  endsAt: string | null; // ISO timeout của lượt hiện tại
  entries: InvitationQueueEntry[];
};

type InvitationQueueEntry = {
  id: string;
  userId: string;
  position: number;
  status: EntryStatus;
  user: { id: string; name: string; avatarUrl?: string; alcoholLevel?: AlcoholLevel };
};
```

---

## API (gợi ý — chỉnh theo Nest thực tế)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/invitation-queue/me` hoặc `?sessionId=` | Queue của tôi / theo session |
| POST | `/invitation-queue` | Tạo queue |
| POST | `.../accept` | Accept lượt hiện tại |
| POST | `.../reject` | Reject |
| POST | `.../skip` | Host skip head |
| POST | `.../cancel` | Hủy queue |

Mọi lỗi: `error.code` (vd. `INVITATION_TIMEOUT`, `NOT_YOUR_TURN`, `QUEUE_NOT_ACTIVE`).

---

## Real-time events (Socket)

| Event (contract BE) | FE handling |
|---------------------|-------------|
| `invitation-queue.updated` | `setQueryData` full/partial queue |
| `invitation-queue.advanced` | Update current + endsAt; layout animation |
| `invitation-queue.your-turn` | Haptic + navigate/sheet + sound optional nhẹ |
| `invitation-queue.completed` | Invalidate session members |
| `invitation-queue.cancelled` | Toast + UI cancelled |

**Room:** `session:{sessionId}` hoặc `queue:{queueId}` — theo backend.

Fallback: `refetchInterval: socketConnected ? false : 15_000`.

---

## Countdown timeout UI

### Nguồn thời gian

- `endsAt` (ISO) từ server — **bắt buộc**.
- Client: `remainingMs = endsAt - serverNowSkew`.
- Optional: NTP/server `timestamp` response để chỉnh clock skew.

### Render

```
remainingMs > 0:
  label = format mm:ss (tabular nums)
  urgency =
    > 30s → "normal"
    ≤ 30s → "warning"
    ≤ 10s → "critical" (pulse + danger color)
= 0:
  label = "Hết giờ"
  disable Accept/Reject (hoặc keep 1s rồi disable)
  show subtle "Đang chuyển lượt…"
```

### Hook

```ts
useQueueCountdown(endsAt: string | null, onLocalExpire?: () => void)
// interval 250–1000ms
// cleanup on unmount
// không ghi Zustand mỗi tick
```

### A11y

- `accessibilityLiveRegion` cho countdown (thưa: mỗi 10s, không mỗi giây).
- Nút Accept: “Chấp nhận lời mời, còn X giây”.

---

## Optimistic update: Accept / Reject

### Accept

1. **onMutate**
   - Cancel `invitationQueueKeys.detail(id)`
   - Snapshot previous
   - `setQueryData`: entry → `accepted`; optional optimistic add self to session members cache
2. **UI ngay:** CTA loading → success check
3. **onError:** rollback + toast (`NOT_YOUR_TURN`, `INVITATION_TIMEOUT`…)
4. **onSettled:** invalidate queue + session detail

### Reject

1. Optimistic: entry → `rejected`, clear local “my turn” UI
2. Expect socket `advanced` sớm; nếu không, invalidate
3. Rollback nếu fail

### Race với timeout

- Nếu user bấm Accept khi server đã timeout → API error `INVITATION_TIMEOUT` → toast “Hết giờ mất rồi, chờ lượt sau nha” + sync queue.

**Không** optimistic advance toàn queue (sai thứ tự) — chỉ đổi status entry của mình.

---

## UI states

### Loading

- Skeleton: header session + 3–5 row avatar shimmer dark.
- Lần đầu full skeleton; refresh: silent / pull-to-refresh.

### Empty

| Context | Copy gợi ý |
|---------|------------|
| Host chưa có ai | “Hàng mời đang trống. Thêm người hoặc bật matchmaking nhé.” |
| User không trong queue | “Bạn không nằm trong hàng mời lần này.” |
| Completed | “Mời xong hết rồi — vào bàn thôi!” |

CTA: primary theo role.

### Error

- Inline card + “Thử lại” gọi `refetch`.
- Không blank screen.

### My turn (critical UX)

- Sheet/full: avatar host, tên session, mode, **countdown lớn**, 2 CTA:
  - Primary: **Chấp nhận**
  - Danger outline: **Từ chối**
- Chặn back vô tình: confirm “Bỏ lỡ lời mời?”

### Host view

- List entries ordered; highlight head.
- Actions: Skip (confirm), Cancel queue (confirm destructive).
- Live countdown head.

---

## Folder structure

```
features/invitation-queue/
├── domain/
│   ├── types.ts
│   ├── status.ts              # unions + helpers isActiveEntry
│   └── format-eta.ts
├── data/
│   ├── invitation-queue.api.ts
│   ├── invitation-queue.socket.ts
│   ├── mappers.ts
│   └── query-keys.ts
├── model/
│   ├── use-invitation-queue.ts
│   ├── use-queue-countdown.ts
│   ├── use-accept-invite.ts
│   └── use-reject-invite.ts
├── ui/
│   ├── queue-list.tsx
│   ├── queue-entry-row.tsx
│   ├── queue-countdown.tsx
│   ├── my-turn-sheet.tsx
│   └── queue-empty.tsx
├── screens/
│   └── invitation-queue-screen.tsx
└── index.ts
```

---

## Copy tiếng Việt (gợi ý i18n keys)

```
queue.title = "Hàng mời tuần tự"
queue.yourTurn = "Tới lượt bạn rồi!"
queue.position = "Bạn đang ở vị trí #{{n}}"
queue.accept = "Chấp nhận"
queue.reject = "Từ chối"
queue.timeout = "Hết giờ phản hồi"
queue.advancing = "Đang chuyển người tiếp theo…"
queue.skip = "Bỏ qua người này"
queue.waitingNetwork = "Mất kết nối — đang đồng bộ…"
```

Emoji: tối đa 1 ở title sheet (🍻 optional) — **không** rải full list.

---

## Testing bắt buộc

| Case | Expect |
|------|--------|
| Countdown 9s | urgency critical |
| Accept success | mutation + cache |
| Accept after timeout error | toast + refetch |
| Socket advanced | head đổi, animation |
| Offline accept | error NETWORK + no corrupt cache |
| Waiting user | no accept button |

---

## Best Practices

- Server `endsAt` là chuẩn; client chỉ hiển thị.
- Socket patch + invalidate khi payload mơ hồ.
- Haptic nhẹ khi your-turn (iOS/Android).
- Log analytics: time_to_accept, timeout_rate (không PII thừa).
- Safe area cho CTA đôi.

## Anti-patterns cần tránh

- FE tự `setTimeout` advance queue.
- Cho waiting user bấm Accept “phòng hờ”.
- Countdown setState 60fps.
- Optimistic xóa cả list entries.
- Ignore event order (apply stale payload không version/timestamp).
- Copy “Error 500” cho user cuối.

---

## Definition of Done

- [ ] Align status với backend
- [ ] Countdown + urgency colors
- [ ] Accept/Reject optimistic + rollback
- [ ] Socket advanced/your-turn
- [ ] Empty/loading/error
- [ ] Host skip/cancel (nếu MVP)
- [ ] i18n VI
- [ ] Tests domain + hooks cốt lõi
