# 01 — Project Context: LiquidNetwork (Cồn Thủ)

## Tóm tắt một câu

**LiquidNetwork** là Super App kết nối cộng đồng nhậu Việt Nam: ghép bàn, mời tuần tự, chat, session thực tế, đánh giá sau buổi, và tính năng an toàn “đã uống không lái”.

Tên nội bộ: **Cồn Thủ Super App**.

---

## Vấn đề cần giải quyết

- Tìm bạn nhậu / networking đêm khó, group chat lộn xộn, không có quy trình mời có trật tự.
- Người say vẫn lái xe — thiếu nudge an toàn + đường tắt gọi xe.
- Hồ sơ mạng xã hội không phản ánh “style nhậu” (độ chịu rượu, vibe, giới thiệu khi say).

## Tầm nhìn sản phẩm

Trở thành **mạng lưới tin cậy** cho trải nghiệm nhậu có trách nhiệm: vui, có trật tự (queue), có tầng an toàn, có danh tiếng (level + peer review).

---

## Persona & ngữ cảnh VN

| Persona | Nhu cầu | Tone UI |
|---------|---------|---------|
| Sinh viên / nhân viên 20–35 | Ghép bàn nhanh, chat vui | Thân mật, meme nhẹ |
| Dân networking | Bàn Networking, hồ sơ rõ | Chuyên nghiệp hơn một chút |
| “Chiến thần” | Match Debate / Uống đấm (fun mode) | Hype, nhưng có warning an toàn |
| Host session | Mời tuần tự, quản queue | Rõ trạng thái, countdown |

**Copywriting:** tiếng Việt đời thường (“Chờ xíu…”, “Hết giờ mời rồi”, “Đã uống — đừng lái”). Emoji **vừa phải** (1–2 / block copy). Không slang toxic, không cổ vũ say xỉn lái xe.

---

## Feature cốt lõi

### 1. Sequential Invite Queue ★ (quan trọng nhất)

Hệ thống **mời nhậu tuần tự** có timeout. Chỉ một “đầu hàng” được mời tại một thời điểm; hết giờ → advance; accept/reject → cập nhật queue real-time (BullMQ + Socket trên backend).

→ Chi tiết: `features/invitation-queue.md`

### 2. Drunk Profile + Level Tửu Lượng

Hồ sơ nhậu: giới thiệu, nghề, vibe. Level 4 cấp:

| Level | Tên hiển thị | Ý nghĩa UX |
|-------|--------------|------------|
| 1 | **Nếm Bọt** | Mới / nhẹ |
| 2 | **Vui Vẻ** | Social drinker |
| 3 | **Chiến Thần** | Chịu tốt, hype |
| 4 | **Bất Tử** | Top tier (badge nổi) |

Peer Review sau session ảnh hưởng uy tín / level (theo rule backend).

### 3. Matchmaking modes

| Mode | Mục tiêu |
|------|----------|
| **Networking** | Gặp gỡ, kết nối nghề |
| **Giải sầu** | Tâm sự, nhẹ nhàng |
| **Debate** | Tranh luận vui |
| **Uống đấm nhau** | Competitive fun — **phải** có disclaimer an toàn |

### 4. Drinking Session

Buổi nhậu thực tế: host, members, trạng thái, liên kết queue + chat + review.

### 5. Safe Ride — “Đã uống không lái”

- Nudge khi session kết thúc / user đánh dấu đã uống
- Gọi xe nhanh (deep link / partner SDK — theo phase)
- Không được ẩn sau nhiều bước

### 6. Chat real-time

Socket.io: 1-1 / group session, typing, reconnect, offline queue message (nếu có).

---

## Backend alignment (bắt buộc hiểu)

| Backend | Frontend cần |
|---------|----------------|
| NestJS modules | Feature modules mirror tên domain |
| Clean Architecture | UI không gọi repository; qua API client + use-cases/hooks |
| BullMQ | Timeout/advance queue — FE chỉ subscribe events + poll fallback |
| Socket.io | Rooms theo session/queue/user; event names đồng bộ BE |
| Exception `error.code` | Map i18n + toast thân thiện |

**Không** assume payload — luôn bám DTO/OpenAPI/Swagger backend.

---

## Mục tiêu sản phẩm theo phase (gợi ý)

| Phase | Focus |
|-------|--------|
| MVP | Auth, Drunk Profile, Session, Invitation Queue, Chat cơ bản |
| Growth | Matchmaking modes, Peer Review, Safe Ride polish |
| Scale | Performance list, offline-ish, analytics, A/B copy |

---

## KPI / tín hiệu UX quan trọng

- Tỷ lệ accept invite trong timeout
- Thời gian average “waiting in queue”
- % user bấm Safe Ride sau session
- Crash-free sessions, reconnect chat success
- Time-to-interactive màn Queue / Chat

---

## Best Practices

- Mọi màn hình “đêm” mặc định dark theme.
- Feature liên quan rượu luôn có lối thoát an toàn (Safe Ride / báo cáo).
- State machine queue/session **copy từ backend**, không tự invent status.
- Copy lỗi dùng `error.code` → tiếng Việt gần gũi, không dump stack.

## Anti-patterns cần tránh

- Gamify say xỉn đến mức nguy hiểm (không điểm thưởng cho “uống thêm”).
- Ẩn Safe Ride trong settings sâu.
- UI tiếng Anh lẫn Việt không nhất quán.
- Coi Invitation Queue như “list invite thường” (mất sequential + timeout).
- FE tự “advance queue” — advance là việc của backend/worker.

---

## Tài liệu liên quan

- Kiến trúc: `02-architecture.md`
- Design: `03-design-system.md`
- Queue: `features/invitation-queue.md`
