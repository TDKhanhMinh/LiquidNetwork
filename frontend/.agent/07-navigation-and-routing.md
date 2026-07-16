# 07 — Navigation & Routing (Expo Router)

## Nguyên tắc

- **File-based routing** trong `src/app/` (hoặc `app/`).
- Route = entry mỏng; screen logic nằm `features/*`.
- Deep link sẵn sàng cho session, queue, safe-ride.
- Auth gate bằng layout groups + redirect.

---

## Cấu trúc route gợi ý

```
app/
├── _layout.tsx                 # providers: Query, Gesture, Theme, Socket
├── index.tsx                   # redirect auth/home
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx               # Home / discover
│   ├── sessions.tsx
│   ├── chat.tsx
│   └── profile.tsx
├── session/
│   └── [id]/
│       ├── _layout.tsx
│       ├── index.tsx           # session detail
│       ├── queue.tsx           # invitation queue
│       └── chat.tsx
├── matchmaking/
│   └── index.tsx
├── safe-ride.tsx
└── +not-found.tsx
```

### Groups

| Group | Mục đích |
|-------|----------|
| `(auth)` | Stack login/register — không tab |
| `(tabs)` | Main shell |
| Modal routes | `modal` presentation cho Safe Ride / confirm |

---

## Auth flow

```
Splash / index
  → có token hợp lệ? 
      → (tabs)
      → (auth)/login
```

- 401 sau refresh fail → `router.replace("/login")` + clear session.
- `unauthorized()` pattern web không có trên RN — dùng redirect tương đương.

```tsx
// app/(tabs)/_layout.tsx
const isAuthed = useAuthStore(s => s.isAuthenticated);
if (!isAuthed) return <Redirect href="/login" />;
```

---

## Typed routes & params

```tsx
// session/[id]/queue.tsx
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams<{ id: string }>();
```

- Validate `id` (zod); invalid → not-found UI.
- Tránh truyền object lớn qua params — chỉ id, fetch bằng Query.

---

## Navigation patterns

| Pattern | API |
|---------|-----|
| Push stack | `router.push("/session/123")` |
| Replace | `router.replace("/login")` |
| Back | `router.back()` |
| Tabs | `router.push("/(tabs)/chat")` |
| Reset | dismiss stack khi logout |

**Deep link examples:**

```
liquidnetwork://session/abc123/queue
liquidnetwork://safe-ride?sessionId=abc123
```

Cấu hình scheme trong `app.json` / Expo config.

---

## UX navigation

- Header: title tiếng Việt ngắn, back rõ.
- Queue / Chat: giữ state scroll khi back (Query cache).
- Prevent double navigate (debounce CTA).
- Safe Ride: **priority route** — mở modal/fullscreen dễ chạm.

### Hardware back (Android)

- Modal → đóng modal trước.
- Form dirty → confirm discard.
- Không back ra khỏi auth loop kỳ lạ.

---

## Loading & error routes

- `+not-found.tsx` — 404 thân thiện VN.
- Feature error boundary (ErrorBoundary) quanh stack session.
- Fallback UI theo design system (`ErrorState` pattern).

---

## Best Practices

- Groups `(auth)` / `(tabs)` để tách layout.
- Params tối giản (id only).
- Prefetch query khi `onPressIn` (optional) cho session detail.
- Test deep link cold start.
- Đồng bộ tab icon với design tokens (amber active).

## Anti-patterns cần tránh

- Business logic trong `_layout.tsx` phình to.
- Navigate bằng raw URL string rải rác không constant.
- Truyền JWT qua query params.
- Nested navigators không cần thiết gây double header.
- Block back button im lặng không feedback.

---

## Checklist màn mới

- [ ] File route đúng group
- [ ] Screen import từ feature
- [ ] Auth requirement rõ
- [ ] Params typed + validate
- [ ] Back / deep link OK
- [ ] Title i18n
