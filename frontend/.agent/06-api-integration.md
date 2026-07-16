# 06 — API Integration (NestJS)

## Tổng quan

Frontend nói chuyện với NestJS qua:

1. **HTTP** — REST (Axios hoặc fetch wrapper) + interceptors  
2. **Socket.io** — events real-time  
3. **Error envelope** — map `error.code` → i18n toast/UI  

Base URL: env `EXPO_PUBLIC_API_BASE_URL` (mobile).

---

## Response chuẩn backend

### Success

```ts
type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  timestamp?: string;
};
```

### Error (AllExceptionsFilter)

```ts
type ExceptionResponse = {
  success: false;
  error: {
    code: string;      // VALIDATION_ERROR | UNAUTHORIZED | INVITATION_TIMEOUT | ...
    message: string;
    details?: unknown;
  };
  timestamp?: string;
  path?: string;
};
```

Client **normalize** thành:

```ts
class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}
```

---

## HTTP client requirements

| Requirement | Hành vi |
|-------------|---------|
| Base URL | Từ env |
| Auth header | `Authorization: Bearer <access_token>` |
| Unwrap | `success: true` → trả `data` |
| 401 | Refresh token single-flight + retry; fail → logout |
| Network fail | `code: NETWORK_ERROR` |
| Timeout | Configurable (mặc định 30s) |

### Token storage (mobile)

- Access + refresh: **SecureStore** (hoặc tương đương), keys thống nhất (`access_token`, `refresh_token`).
- Không log token.

### Skip refresh paths

`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/google`

### Refresh flow

1. Request A → 401  
2. Nếu đang refresh: xếp hàng  
3. POST `/auth/refresh` { refreshToken } bằng client **không** interceptor retry  
4. Lưu token mới → retry A  
5. Fail → clear tokens → navigate login  

---

## Tổ chức API theo feature

```
features/invitation-queue/data/
  invitation-queue.api.ts
  query-keys.ts
  mappers.ts
  invitation-queue.socket.ts
```

```ts
// invitation-queue.api.ts
export const invitationQueueApi = {
  getMine: () => apiClient.get<QueueDto>("/invitation-queue/me"),
  accept: (id: string) => apiClient.post(`/invitation-queue/${id}/accept`),
  reject: (id: string) => apiClient.post(`/invitation-queue/${id}/reject`),
};
```

Mapper: `QueueDto` → `InvitationQueue` domain (đổi `_id` → `id`, date string → Date/ISO).

---

## Pagination

Backend có thể:

- **Offset:** `page`, `limit`, `total`, `totalPages`
- **Cursor:** `nextCursor`, `hasNextPage`

TanStack Query:

```ts
useInfiniteQuery({
  queryKey: keys.list(filters),
  queryFn: ({ pageParam }) => api.list({ cursor: pageParam }),
  getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
});
```

UI: `FlashList` + `onEndReached` + footer spinner.

---

## Error handling + i18n

```ts
// shared
function resolveErrorMessage(error: unknown, t: TFunction): string {
  const e = normalizeApiError(error);
  if (e.code) {
    const key = `errors.${e.code}`;
    const msg = t(key);
    if (msg !== key) return msg;
  }
  return e.message || t("errors.UNKNOWN");
}
```

| code (ví dụ) | Copy gợi ý |
|--------------|------------|
| `VALIDATION_ERROR` | “Thông tin chưa hợp lệ, kiểm tra lại nha” |
| `UNAUTHORIZED` | “Hết phiên đăng nhập, đăng nhập lại nhé” |
| `FORBIDDEN` | “Bạn không có quyền làm việc này” |
| `NOT_FOUND` | “Không tìm thấy dữ liệu” |
| `INVITATION_TIMEOUT` | “Hết thời gian phản hồi lời mời” |
| `NETWORK_ERROR` | “Mạng yếu hoặc mất kết nối” |

Toast: sonner-like / custom Toast design system.  
Form: map `details` validation vào field errors nếu backend trả array.

---

## Idempotency & double-tap

- Mutation buttons: `isPending` disable.
- Accept/Reject: chặn spam (queue feature).

---

## Versioning & headers (optional)

```
Accept: application/json
X-App-Version: 1.0.0
X-Platform: ios | android
```

Hữu ích khi backend cần force-update.

---

## Testing API layer

- Mock `apiClient` / MSW nếu có.
- Unit test mapper + error normalize.
- Integration: refresh queue logic (fake timers).

---

## Best Practices

- Một `apiClient` shared; feature chỉ định endpoint.
- Type DTO gần backend; map sang domain ở biên.
- Luôn handle loading + error UI.
- Log `error.code` + `digest` (nếu có) cho debug, không log PII.
- Document endpoint mới trong feature markdown.

## Anti-patterns cần tránh

- `fetch` rải rác không interceptor.
- Ignore `success: false` body 200 (nếu BE có case này).
- Hard-code base URL production.
- Hiển thị `error.message` tiếng Anh raw cho end-user khi đã có i18n.
- Refresh token song song không queue (race).
- FE “tự sửa” business rule (advance queue) thay vì gọi API đúng.

---

## Checklist tích hợp endpoint mới

- [ ] Path + method đúng module Nest
- [ ] Types + mapper
- [ ] Query key / mutation
- [ ] Error code i18n
- [ ] Loading/empty/error UI
- [ ] Auth required? token?
- [ ] Real-time side effect?
