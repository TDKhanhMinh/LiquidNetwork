# Bộ Agent Frontend — LiquidNetwork (Cồn Thủ Super App)

> Tài liệu hướng dẫn cho **AI agent** và **developer** khi làm việc với Frontend mobile của LiquidNetwork.

## Mục đích

Bộ `.agent/` chuẩn hóa:

- Ngữ cảnh sản phẩm & domain “nhậu”
- Kiến trúc feature-based + Clean-ish
- Design system “nhậu đêm”
- State, API, navigation, performance
- Đặc tả feature cốt lõi (đặc biệt **Invitation Queue**)
- Prompt sẵn dùng để tạo screen / feature / component / refactor

**Mọi agent phải đọc file này trước**, sau đó đọc các file liên quan theo nhiệm vụ.

---

## Tech stack (bắt buộc)

| Hạng mục | Lựa chọn |
|----------|----------|
| Framework | React Native + Expo (SDK mới nhất) |
| Language | TypeScript **strict** |
| Styling | NativeWind (Tailwind) + theme tokens |
| Server state | TanStack Query |
| Client/global state | Zustand |
| Navigation | Expo Router (file-based) |
| Real-time | Socket.io-client |
| Form | React Hook Form + Zod |
| UI | Design system tự build (không NativeBase) |
| Animation | Reanimated + Gesture Handler |
| Testing | Jest + RNTL |

Backend: NestJS + Clean Architecture + BullMQ + Socket.io. Frontend **đồng bộ contract** (DTO, error code, event name) với backend.

---

## Cấu trúc bộ agent

```
.agent/
├── 00-README.md                 ← bạn đang ở đây
├── 01-project-context.md
├── 02-architecture.md
├── 03-design-system.md
├── 04-coding-conventions.md
├── 05-state-and-data.md
├── 06-api-integration.md
├── 07-navigation-and-routing.md
├── 08-performance-and-optimization.md
├── features/
│   ├── invitation-queue.md      ★ quan trọng nhất
│   ├── drunk-profile.md
│   ├── drinking-session.md
│   ├── matchmaking.md
│   ├── safe-ride.md
│   └── chat.md
├── components/
│   ├── atomic-design.md
│   └── common-patterns.md
└── prompts/
    ├── create-new-screen.md
    ├── create-feature-module.md
    ├── create-ui-component.md
    └── refactor-existing-code.md
```

---

## Cách dùng theo loại task

| Task | Đọc tối thiểu |
|------|----------------|
| Feature mới | `01` → `02` → `04` → `features/<tên>` → `prompts/create-feature-module` |
| Screen mới | `02` → `03` → `07` → `prompts/create-new-screen` |
| Component UI | `03` → `components/*` → `prompts/create-ui-component` |
| API / error | `06` → `05` |
| Real-time | `05` + feature tương ứng (queue, chat, session) |
| Invitation Queue | **Bắt buộc** `features/invitation-queue.md` đầy đủ |
| Refactor | `04` → `08` → `prompts/refactor-existing-code` |
| Performance | `08` |

### Quy trình agent khuyến nghị

1. **Hiểu domain** — đọc `01-project-context.md`
2. **Chọn layer đúng** — `02-architecture.md` (không nhét logic vào UI)
3. **Tuân design** — `03-design-system.md` (dark-first, tone Việt)
4. **Implement** — theo conventions + feature doc
5. **Verify** — TypeScript, tests, empty/loading/error states, a11y cơ bản

---

## Nguyên tắc bất biến

1. **Dark mode first** — cảm xúc “nhậu đêm”, không nhìn như app banking ban ngày.
2. **Tiếng Việt thân thiện** — vui vừa phải, emoji tiết chế, không lố, không toxic.
3. **Feature isolation** — feature không import chéo sâu vào feature khác; dùng public API.
4. **Server state ≠ UI state** — TanStack Query cho API; Zustand cho session/socket/UI global.
5. **Đồng bộ backend** — error `code`, pagination meta, socket events theo NestJS.
6. **An toàn là ưu tiên** — Safe Ride (“Đã uống không lái”) không bị chôn dưới feature vui.

---

## Mapping mono-repo (tham chiếu)

| Repo/thư mục | Vai trò |
|--------------|---------|
| `backend/` | NestJS modules: auth, users, drinking-sessions, invitation-queue, matchmaking, chat, safe-ride, notifications |
| `frontend/` (web) | Next.js (nếu có) — **không** trộn convention RN vào web |
| App mobile (Expo) | Mục tiêu của bộ `.agent` này |

Khi API/DTO backend thay đổi: cập nhật `06-api-integration.md` + feature doc tương ứng.

---

## Best Practices

- Đọc feature doc **trước** khi viết code UI.
- Copy pattern từ `prompts/*` thay vì improvise cấu trúc folder.
- Giữ markdown agent **cập nhật** khi product decision đổi (level tửu lượng, mode matchmaking…).
- Ưu tiên user flow Việt Nam: timeout rõ, copy countdown dễ hiểu, CTA lớn khi say/mệt.

## Anti-patterns cần tránh

- Agent bỏ qua `invitation-queue.md` rồi “tự nghĩ” state machine.
- Trộn web Next.js FSD path với Expo Router path trong cùng PR.
- Hard-code màu hex rải rác thay vì design tokens.
- Dùng thư viện UI nặng (NativeBase, Paper full kit) phá design system.
- Viết copy tiếng Anh mặc định cho màn hình user-facing.

---

## Phiên bản

| Field | Value |
|-------|--------|
| Project | LiquidNetwork / Cồn Thủ |
| Scope | Frontend mobile (Expo) |
| Language docs | Tiếng Việt |
| Maintainer | Frontend Architect + Team |

Khi thêm feature mới: tạo `features/<feature>.md` + cập nhật bảng “Cách dùng” ở file này.
