# 02 — Kiến trúc Frontend (Feature-based + Clean-ish)

> Checklist bắt buộc trong file này: (1) Feature-based folder structure · (2) Tách UI / Domain / Data · (3) Naming kebab-case · (4) Shared vs feature components · (5) Best Practices + Anti-patterns.

## Mục tiêu kiến trúc

1. **Feature-first**: mỗi domain (queue, session, chat…) tự chứa UI + domain + data tối đa.
2. **Clean-ish layers**: UI mỏng; business rules ở model/use-cases; IO ở data/api.
3. **Đồng bộ NestJS**: tên feature ≈ backend `modules/*`.
4. **Expo Router**: routing là entry mỏng, không nhét business.

```
Presentation (screens / components)
        ↓
Application (hooks, use-cases, stores slice)
        ↓
Domain (types, entities, state machines, validators)
        ↓
Data (api clients, socket, mappers, query keys)
        ↓
Shared (ui-kit, lib, config, i18n)
```

Phụ thuộc **một chiều từ trên xuống**. Domain **không** import React Native UI.

---

## Cấu trúc thư mục khuyến nghị (Expo)

```
src/
├── app/                          # Expo Router — file-based routes ONLY
│   ├── (auth)/
│   ├── (tabs)/
│   ├── session/[id]/
│   ├── _layout.tsx
│   └── +not-found.tsx
│
├── features/                     # Feature modules (kebab-case)
│   ├── invitation-queue/
│   │   ├── ui/                   # components riêng feature
│   │   ├── screens/              # nếu không đặt screen trong app/
│   │   ├── model/                # hooks, store slice, use-cases, machines
│   │   ├── data/                 # api, socket handlers, mappers, query-keys
│   │   ├── domain/               # types, enums, pure functions
│   │   └── index.ts              # public API của feature
│   ├── drunk-profile/
│   ├── drinking-session/
│   ├── matchmaking/
│   ├── safe-ride/
│   ├── chat/
│   └── auth/
│
├── shared/
│   ├── ui/                       # design system (atoms/molecules)
│   ├── lib/                      # cn, format, date, storage
│   ├── api/                      # axios/fetch instance, interceptors
│   ├── config/                   # env, constants
│   ├── hooks/                    # hooks cross-feature thật sự generic
│   ├── stores/                   # zustand root (auth session, app settings)
│   ├── i18n/
│   └── types/
│
└── test/                         # helpers, mocks
```

### Quy tắc `app/` vs `features/`

| `app/` | `features/` |
|--------|-------------|
| Khai báo route, layout, deep link | Logic + UI business |
| Import feature public API | **Không** import sâu `app/` |
| Mỏng: compose screen | Dày: state, API, components |

```tsx
// app/session/[id]/queue.tsx
import { InvitationQueueScreen } from "@/features/invitation-queue";

export default function QueueRoute() {
  return <InvitationQueueScreen />;
}
```

---

## Feature public API (`index.ts`)

Chỉ export những gì bên ngoài được dùng:

```ts
// features/invitation-queue/index.ts
export { InvitationQueueScreen } from "./screens/invitation-queue-screen";
export { useInvitationQueue } from "./model/use-invitation-queue";
export type { QueueStatus } from "./domain/types";
// KHÔNG export: internal mapper, private components
```

Feature A **không** import `features/B/data/...`. Nếu cần: lift shared domain lên `shared/` hoặc compose ở screen/app.

---

## Tách UI / Domain / Data

### Domain (pure)

- Types, enums (`QueueStatus`, `AlcoholLevel`)
- State machine transitions (pure function)
- Zod schemas (có thể share form)
- Formatters không phụ thuộc RN

### Data

- `*.api.ts` — HTTP qua shared api client
- `*.socket.ts` — subscribe/emit
- `mappers.ts` — DTO backend → domain model
- `query-keys.ts` — TanStack Query keys factory

### Model (application)

- Hooks: `use-join-queue`, `use-queue-countdown`
- Zustand slices **cục bộ feature** nếu cần (không nhét hết root)
- Use-case functions: `acceptInvite(queueId)`

### UI

- Presentational components + screens
- Nhận props/hooks; **không** `fetch` trực tiếp (trừ hiếm hoi)

---

## Đặt tên file & folder

| Loại | Convention | Ví dụ |
|------|------------|--------|
| Folder | **kebab-case** | `invitation-queue/`, `safe-ride/` |
| File component | **kebab-case** + `.tsx` | `queue-countdown.tsx` |
| Hook | `use-*.ts` | `use-queue-countdown.ts` |
| API | `*.api.ts` | `invitation-queue.api.ts` |
| Types | `types.ts` hoặc `*.types.ts` | `domain/types.ts` |
| Test | `*.test.ts(x)` | `queue-countdown.test.tsx` |
| Store | `*.store.ts` | `auth.store.ts` |

Component export: **PascalCase** (`QueueCountdown`).  
Hook export: **camelCase** (`useQueueCountdown`).  
Constant: **SCREAMING_SNAKE** hoặc `as const` object.

---

## Shared components vs Feature components

| Shared (`shared/ui`) | Feature (`features/X/ui`) |
|----------------------|---------------------------|
| Button, Input, Card, Modal, Avatar base | `QueuePositionBadge`, `DrunkLevelBadge` (nếu chỉ 1 feature) |
| Không biết domain queue/session | Biết status queue, mode matchmaking |
| Stable API, story/test kỹ | Đổi theo product nhanh |

Nếu component dùng ở **≥ 2 features** → promote lên `shared/ui` (sau khi ổn định).

**Badge Level Tửu Lượng**: dùng nhiều nơi → `shared/ui/alcohol-level-badge.tsx`.

---

## Layers & dependencies (tóm tắt)

```
app → features → shared
features/X ↛ features/Y (tránh)
features → shared/api, shared/ui, shared/stores
shared ↛ features, app
domain ↛ react-native, react-query (ưu tiên pure)
```

---

## Đồng bộ backend modules

| Backend `modules/` | Frontend `features/` |
|--------------------|----------------------|
| `auth` | `auth` |
| `users` | `drunk-profile` (+ user settings) |
| `drinking-sessions` | `drinking-session` |
| `invitation-queue` | `invitation-queue` |
| `matchmaking` | `matchmaking` |
| `chat` | `chat` |
| `safe-ride` | `safe-ride` |
| `notifications` | `notifications` (shared + feature) |

---

## Testing architecture

| Layer | Test gì |
|-------|---------|
| Domain | Pure functions, state transitions |
| Model hooks | RNTL + mock Query/socket |
| UI | Interaction, empty/error |
| Screens | Smoke + critical path |

---

## Best Practices

- Screen = composition; logic nằm hook/use-case.
- Mọi network qua `shared/api` + feature `data/*.api.ts`.
- Socket handlers đăng ký/hủy trong `useEffect` hoặc dedicated hook.
- Version query keys theo entity id.
- Document public export trong `index.ts` (comment ngắn).

## Anti-patterns cần tránh

- “God screen” 800 dòng: UI + fetch + socket + navigation.
- Import `features/chat/data/chat.api` từ `invitation-queue`.
- Đặt business types trong component file.
- Folder `components/Button2` / `utils/helpers/final`.
- Dùng `any` để “cho nhanh” vượt Clean boundary.
- Nhân bản axios instance trong từng feature.

---

## Checklist kiến trúc khi review PR

- [ ] File/folder kebab-case
- [ ] Feature có `index.ts` public API
- [ ] Không cross-import feature nội bộ
- [ ] Domain pure (nếu có logic)
- [ ] Route `app/` mỏng
- [ ] Shared UI không chứa domain queue/session cụ thể (trừ token chung)
