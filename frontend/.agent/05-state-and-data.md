# 05 — State & Data Management

## Phân rã trách nhiệm

| Loại state | Công cụ | Ví dụ |
|------------|---------|--------|
| **Server state** | TanStack Query | Profile, queue snapshot, session detail |
| **Global client** | Zustand | Access token meta, user session, theme, socket connection status |
| **Local UI** | `useState` / `useReducer` | Modal open, tab index, input draft |
| **Real-time** | Socket.io + invalidate/setQueryData | Queue advanced, new message |
| **Form** | RHF + Zod | Drunk profile edit, login |

**Nguyên tắc:** không nhét response API vào Zustand “cho tiện”. Zustand chỉ giữ state **thật sự global / cross-route** hoặc ephemeral client.

---

## TanStack Query

### Query keys factory

```ts
// features/invitation-queue/data/query-keys.ts
export const invitationQueueKeys = {
  all: ["invitation-queue"] as const,
  me: () => [...invitationQueueKeys.all, "me"] as const,
  detail: (id: string) => [...invitationQueueKeys.all, "detail", id] as const,
  bySession: (sessionId: string) =>
    [...invitationQueueKeys.all, "session", sessionId] as const,
};
```

### Defaults khuyến nghị

```ts
staleTime: 30_000,          // chỉnh theo feature (chat messages: thấp hơn)
gcTime: 5 * 60_000,
retry: (count, err) => !isClientError(err) && count < 2,
refetchOnWindowFocus: false, // mobile: thường false; dùng AppState nếu cần
```

### Patterns

| Pattern | Khi nào |
|---------|---------|
| `useQuery` | Đọc |
| `useMutation` + `invalidateQueries` | Ghi + list đổi |
| `setQueryData` | Optimistic / socket patch |
| `placeholderData` / `initialData` | UX mượt khi back-navigate |

### Optimistic update (Accept / Reject)

1. `onMutate`: cancel queries → snapshot → `setQueryData` trạng thái mới  
2. `onError`: rollback snapshot  
3. `onSettled`: invalidate để đồng bộ server  

Chi tiết queue: `features/invitation-queue.md`.

---

## Zustand

### Auth / session store (shared)

```ts
// shared/stores/auth.store.ts
type AuthState = {
  userId: string | null;
  // tokens: ưu tiên secure store; store chỉ flag isAuthenticated
  isAuthenticated: boolean;
  setSession: (userId: string) => void;
  clearSession: () => void;
};
```

- **Access/refresh token**: SecureStore / encrypted storage — **không** log.
- Persist partial: theme, language — dùng `persist` middleware cẩn thận.

### Feature slice (optional)

Queue UI selection, draft message — nếu chỉ 1 screen: `useState` đủ.  
Nếu nhiều screen trong feature: `features/X/model/x.store.ts`.

---

## Real-time (Socket.io-client)

### Connection lifecycle

```
App foreground → connect (with auth token)
Token refresh → reconnect / update auth
App background → disconnect hoặc giữ (policy pin)
Logout → disconnect + clear listeners
```

### Integration với Query

```ts
socket.on("invitation-queue.advanced", (payload) => {
  queryClient.setQueryData(invitationQueueKeys.detail(payload.queueId), map(payload));
  // hoặc invalidate nếu payload mỏng
});
```

| Nên | Không nên |
|-----|-----------|
| 1 socket manager singleton | `io()` mỗi component |
| Namespace/room theo session | Global listen mọi event không cleanup |
| Event name = backend contract | Tự đặt `queueUpdate2` |

### Reconnect UX

- Banner “Mất kết nối — đang thử lại…”
- Chat: queue tin nhắn pending (nếu product yêu cầu)
- Queue: fallback poll 15–30s khi socket down

---

## Form state

```ts
const form = useForm({
  resolver: zodResolver(drunkProfileSchema),
  defaultValues: mapFromServer(data),
});
```

- Schema Zod **đồng bộ rule** validation backend (message Việt).
- Submit → mutation; disable double submit.

---

## Derived / computed

- Countdown: derive từ `endsAt` + `now` (interval 250–1000ms), không store mỗi tick vào Zustand.
- Selector Zustand: `useAuthStore(s => s.userId)` để tránh re-render toàn app.

---

## Cache invalidation map (gợi ý)

| Action | Invalidate |
|--------|------------|
| Login | `["user"]`, session |
| Update profile | `userKeys.me()` |
| Accept invite | queue detail + session members |
| Leave session | session detail, my sessions |
| Send message | thường **không** full invalidate — append cache |

---

## Best Practices

- Một nguồn sự thật cho server data: Query cache.
- Socket chỉ **patch** cache, không tạo state song song lệch.
- Type payload socket giống DTO backend (shared types gen nếu có).
- Test optimistic với rollback.
- Clear cache on logout (`queryClient.clear()` + store reset).

## Anti-patterns cần tránh

- `useEffect` + `fetch` + `useState` lặp lại thay Query.
- Lưu toàn bộ React Query data vào Zustand.
- Optimistic không rollback.
- Socket listener register mỗi re-render.
- `staleTime: Infinity` cho queue đang live.
- Polling 1s “cho chắc” giết pin + server.

---

## Checklist feature real-time

- [ ] Connect auth đúng token
- [ ] Join/leave room khi mount/unmount screen
- [ ] Handler → setQueryData/invalidate
- [ ] UI offline/reconnect
- [ ] Logout cleanup
