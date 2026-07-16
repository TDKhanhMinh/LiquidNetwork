# Feature: Drinking Session

## Mục tiêu

Mô hình **buổi nhậu** thực tế: host, thành viên, trạng thái vòng đời, liên kết queue / chat / review / safe-ride.

---

## Vòng đời session (UI)

| Status | Ý nghĩa | UI |
|--------|---------|-----|
| `scheduled` / `open` | Chưa bắt đầu / đang mở | Join, mời queue |
| `live` / `in_progress` | Đang diễn ra | Chat, members, safe nudge |
| `ended` | Kết thúc | Review, Safe Ride CTA nổi |
| `cancelled` | Hủy | Read-only reason |

Align đúng enum backend `drinking-sessions`.

---

## User flows

1. **Tạo session** (host) — title, mode, time, privacy.
2. **Vào session** — deep link / list “Session của tôi”.
3. **Mời** — điều hướng Invitation Queue.
4. **Trong session** — members, chat tab, host tools.
5. **Kết thúc** — host end → prompt Peer Review + Safe Ride.
6. **Rời session** — confirm.

---

## Screens

- `SessionListScreen`
- `SessionDetailScreen` (tabs: Overview | Queue | Chat | People)
- `CreateSessionScreen` (RHF + Zod)

---

## Data & real-time

- REST: CRUD session, members
- Socket: `session.updated`, `member.joined`, `member.left`
- Invalidate: `sessionKeys.detail(id)`, `sessionKeys.mine()`

---

## UX Việt

- “Bàn đang nhậu” / “Chưa bắt đầu” — tránh jargon.
- Host badge rõ.
- End session: warning “Kết thúc bàn cho mọi người?”

---

## Best Practices

- Session id only trong route params.
- Sau `ended`, Safe Ride entry point **above the fold**.
- Member list FlashList + avatar level badge.

## Anti-patterns cần tránh

- Trộn toàn bộ chat UI vào 1 file session 2k dòng.
- Cho member thường gọi API host-only không disable UI.
- Không handle session cancelled khi đang mở màn.
