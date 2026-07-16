# LiquidNetwork Backend — Thống kê & mô tả Request / Response

> **Phiên bản tài liệu:** 1.0  
> **Nguồn:** code tại `src/` (controllers, DTOs, interceptors, filters)  
> **Base URL:** `http://localhost:{PORT}/api` (mặc định `PORT=3000`)  
> **Swagger (dev):** `http://localhost:{PORT}/api/docs`

---

## 1. Tổng quan

### 1.1. Thống kê endpoint (theo code hiện có)

| Module | Controller path | Số endpoint | Mounted trong `AppModule` | Auth (JWT) |
|--------|-----------------|-------------|---------------------------|------------|
| **App** (root) | `/` | 1 | Có | Không |
| **Auth** | `/auth` | 6 | Có | 2/6 (logout, me) |
| **Users** | `/users` | 6 | Có | Tất cả |
| **Peer Reviews** (trong UsersModule) | `/users/:id/reviews` | 2 | Có | Tất cả |
| **Drinking Sessions** | `/drinking-sessions` | 1 | **Không** (mock, chưa import) | Swagger ghi Bearer nhưng **chưa gắn Guard** |
| Chat / Matchmaking / Notifications / Safe-ride / Invitation-queue | — | 0 | Chưa có HTTP | — |

**Tổng endpoint đã định nghĩa trong code:** **16**  
**Tổng endpoint đang serve khi app chạy:** **15** (trừ `POST /drinking-sessions` vì module chưa mount)

### 1.2. Convention chung

| Mục | Mô tả |
|-----|--------|
| Global prefix | `api` → mọi route HTTP = `/api/...` |
| Content-Type | `application/json` (request body) |
| Auth header | `Authorization: Bearer <accessToken>` |
| Validation | Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform` |
| Success envelope | Global `ResponseInterceptor` |
| Error envelope | Global `AllExceptionsFilter` |

### 1.3. Success response (chuẩn)

Mọi handler **success** được bọc:

```json
{
  "success": true,
  "data": <payload từ controller>,
  "message": "<optional>",
  "meta": { "<optional pagination>" },
  "timestamp": "2026-07-16T10:00:00.000Z"
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|--------|
| `success` | `boolean` | Có | Luôn `true` khi HTTP 2xx qua interceptor |
| `data` | `any` | Có | Payload nghiệp vụ (object, array, string, null) |
| `message` | `string` | Không | Chỉ khi handler trả wrapper có `message` |
| `meta` | `object` | Không | Pagination (`items` + `meta`) |
| `timestamp` | `string` (ISO) | Có | Thời điểm response |

> **Lưu ý double-wrap:** Nếu controller tự return `{ success, data }`, interceptor có thể “bóc” field `data` khi object có ≤ 2 key và có property `data`. Các endpoint Auth/Users thường return plain object/DTO → nằm gọn trong `data`.

### 1.4. Error response (chuẩn)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "errors": ["..."] }
  },
  "timestamp": "2026-07-16T10:00:00.000Z",
  "path": "/api/users/me"
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `success` | `boolean` | Luôn `false` |
| `error.code` | `string` | `UPPER_SNAKE_CASE` |
| `error.message` | `string` | Mô tả lỗi |
| `error.details` | `any` | Optional (validation, keyValue, …) |
| `timestamp` | `string` | ISO |
| `path` | `string` | URL request |

**Production:** HTTP ≥ 500 → client chỉ nhận message generic, không lộ chi tiết nội bộ.

### 1.5. Mã lỗi thường gặp

| HTTP | `error.code` | Khi nào |
|------|--------------|---------|
| 400 | `VALIDATION_ERROR` | Body/query sai class-validator |
| 400 | `INVALID_DATA_TYPE` | Mongo `CastError` (vd. id sai) |
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` / `INVALID_TOKEN` / `USER_NOT_FOUND` | Auth / JWT |
| 401 | `INVALID_REFRESH_TOKEN` / `REFRESH_TOKEN_EXPIRED` / `TOKEN_REUSE_DETECTED` | Refresh |
| 404 | `USER_NOT_FOUND` / `NOT_FOUND` | User ẩn / không tồn tại |
| 409 | `EMAIL_ALREADY_EXISTS` / `CONFLICT` | Email trùng, self-review, duplicate review |
| 501 | `GOOGLE_AUTH_DISABLED` | Google login tắt |
| 500 | `INTERNAL_SERVER_ERROR` / `REGISTRATION_FAILED` | Lỗi hệ thống |

---

## 2. Module: App (root)

**File:** `src/app.controller.ts`  
**Base path:** `/api`

### 2.1. `GET /api`

| | |
|--|--|
| **Mô tả** | Health / hello mặc định Nest |
| **Auth** | Không |
| **Request** | Không body, không query |
| **HTTP status** | `200` |

**Response `data`:**

```json
"Hello World!"
```

**Ví dụ full:**

```json
{
  "success": true,
  "data": "Hello World!",
  "timestamp": "2026-07-16T10:00:00.000Z"
}
```

---

## 3. Module: Auth

**File:** `src/modules/auth/presentation/http/auth.controller.ts`  
**Base path:** `/api/auth`  
**Mounted:** Có (`AuthModule`)

### Thống kê Auth

| Method | Path | Auth | Status success | Ghi chú |
|--------|------|------|----------------|---------|
| `POST` | `/api/auth/register` | Không | `201` (Nest default POST) | Tạo user + tokens |
| `POST` | `/api/auth/login` | Không | `200` | |
| `POST` | `/api/auth/refresh` | Không | `200` | Rotation + reuse detection |
| `POST` | `/api/auth/google` | Không | — | Mặc định **501** (disabled) |
| `POST` | `/api/auth/logout` | JWT | `200` | Optional body refreshToken |
| `GET` | `/api/auth/me` | JWT | `200` | Payload JWT đã validate |

---

### 3.1. `POST /api/auth/register`

| | |
|--|--|
| **Mô tả** | Đăng ký tài khoản (CreateUser + AuthAccount + tokens) |
| **Auth** | Không |

**Request body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | Có | non-empty |
| `email` | `string` | Có | email |
| `password` | `string` | Có | min **8** ký tự |

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "secret123"
}
```

**Response `data` (success)**

| Field | Type | Mô tả |
|-------|------|--------|
| `user.id` | `string` | User id |
| `user.name` | `string` | |
| `user.email` | `string` | |
| `accessToken` | `string` | JWT access |
| `refreshToken` | `string` | Dạng `{userId}:{randomHex}` |

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Nguyen Van A",
      "email": "a@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "664f1a2b3c4d5e6f7a8b9c0d:a1b2c3..."
  },
  "timestamp": "2026-07-16T10:00:00.000Z"
}
```

**Lỗi tiêu biểu:** `409 EMAIL_ALREADY_EXISTS`, `400 VALIDATION_ERROR`, `500 REGISTRATION_FAILED`

---

### 3.2. `POST /api/auth/login`

| | |
|--|--|
| **Mô tả** | Đăng nhập email/password |
| **Auth** | Không |
| **HTTP** | `200` |

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `email` | `string` (email) | Có |
| `password` | `string` | Có |

```json
{
  "email": "a@example.com",
  "password": "secret123"
}
```

**Response `data`:** cùng shape register (`user` + `accessToken` + `refreshToken`).

**Lỗi tiêu biểu:** `401 INVALID_CREDENTIALS` (sai email/password hoặc user soft-deleted)

---

### 3.3. `POST /api/auth/refresh`

| | |
|--|--|
| **Mô tả** | Đổi access token; rotate refresh; phát hiện reuse |
| **Auth** | Không (dùng refresh token trong body) |
| **HTTP** | `200` |

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | `string` | Có |

```json
{
  "refreshToken": "664f1a2b3c4d5e6f7a8b9c0d:a1b2c3..."
}
```

**Response `data`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "664f1a2b3c4d5e6f7a8b9c0d:newraw..."
}
```

**Lỗi tiêu biểu:**  
`INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_EXPIRED`, `TOKEN_REUSE_DETECTED` (revoke all sessions), `USER_NOT_FOUND`

---

### 3.4. `POST /api/auth/google`

| | |
|--|--|
| **Mô tả** | Google login (chưa implement; feature flag) |
| **Auth** | Không |
| **HTTP** | `501` khi `GOOGLE_AUTH_ENABLED=false` (mặc định) |

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `token` | `string` | Có (Google ID token — khi bật) |

```json
{
  "token": "google-id-token-here"
}
```

**Response lỗi (default):**

```json
{
  "success": false,
  "error": {
    "code": "GOOGLE_AUTH_DISABLED",
    "message": "Google login is not enabled. Set GOOGLE_AUTH_ENABLED=true when ready."
  },
  "timestamp": "...",
  "path": "/api/auth/google"
}
```

Nếu bật flag nhưng chưa code xong → `NOT_IMPLEMENTED`.

---

### 3.5. `POST /api/auth/logout`

| | |
|--|--|
| **Mô tả** | Revoke 1 refresh token (nếu gửi) hoặc revoke **tất cả** session |
| **Auth** | JWT bắt buộc |
| **HTTP** | `200` |

**Headers**

```http
Authorization: Bearer <accessToken>
```

**Request body (optional)**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | `string` | Không |

```json
{
  "refreshToken": "664f...:raw..."
}
```

**Response `data`**

```json
{
  "success": true
}
```

> Sau interceptor, client thấy `data.success === true` (payload use-case nằm trong `data`).

---

### 3.6. `GET /api/auth/me`

| | |
|--|--|
| **Mô tả** | User từ JWT strategy (đã load DB, chặn soft-deleted) |
| **Auth** | JWT |
| **HTTP** | `200` |

**Request:** không body.

**Response `data`**

| Field | Type |
|-------|------|
| `id` | `string` |
| `email` | `string` |
| `name` | `string` |

```json
{
  "success": true,
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "email": "a@example.com",
    "name": "Nguyen Van A"
  },
  "timestamp": "..."
}
```

> Khác `GET /api/users/me`: endpoint này **không** trả full profile (drunk profile, privacy, stats).

---

## 4. Module: Users

**Files:**  

- `src/modules/users/presentation/http/users.controller.ts`  
- `src/modules/users/presentation/http/peer-reviews.controller.ts`  

**Base path:** `/api/users`  
**Auth:** JWT trên **tất cả** route  
**Mounted:** Có

### Thống kê Users + Reviews

| Method | Path | Mô tả ngắn |
|--------|------|------------|
| `GET` | `/api/users/me` | Full profile owner |
| `PATCH` | `/api/users/me` | Cập nhật name/phone/avatar/bio |
| `PATCH` | `/api/users/me/drunk-profile` | Cập nhật hồ sơ LiquidNetwork |
| `PATCH` | `/api/users/me/privacy` | Cập nhật privacy |
| `PATCH` | `/api/users/me/tolerance-level` | Cập nhật level |
| `GET` | `/api/users/:id` | Profile theo id (privacy) |
| `POST` | `/api/users/:id/reviews` | Tạo peer review |
| `GET` | `/api/users/:id/reviews` | List reviews (privacy) |

### Enum dùng chung

`alcoholToleranceLevel` / `level`:

| Value | Ý nghĩa (domain) |
|-------|------------------|
| `LEVEL_1` | Thấp |
| `LEVEL_2` | Trung bình |
| `LEVEL_3` | Cao |
| `LEVEL_4` | Rất cao |

### Shape `UserResponseDto`

**Owner** (`isOwner: true` — `/me` và patch `/me/*`, hoặc `GET /:id` khi tự xem):

| Field | Type | Ghi chú |
|-------|------|---------|
| `id` | `string` | |
| `name` | `string` | |
| `email` | `string` | Chỉ owner |
| `phone` | `string?` | |
| `avatar` | `string?` | |
| `bio` | `string?` | |
| `drunkProfile` | `object` | `{ occupation?, education?, selfIntroduction? }` |
| `alcoholToleranceLevel` | `string` | Enum |
| `privacySettings` | `object` | Chỉ owner — `{ hideProfile, hideLevel }` |
| `sessionsJoined` | `number` | |
| `invitationAcceptRate` | `number` | 0–100 |
| `averageRating` | `number` | |
| `totalReviews` | `number` | |

**Public** (non-owner, profile không ẩn):

- **Không** có `email`, **không** có `privacySettings`
- `alcoholToleranceLevel` **bị omit** nếu target `hideLevel === true`

---

### 4.1. `GET /api/users/me`

| | |
|--|--|
| **Auth** | JWT |
| **Request** | Không body |
| **HTTP** | `200` |

**Response `data`:** full owner `UserResponseDto` (có `email`, `privacySettings`, level).

---

### 4.2. `PATCH /api/users/me`

| | |
|--|--|
| **Auth** | JWT |
| **HTTP** | `200` |

**Request body** (tất cả optional; whitelist)

| Field | Type |
|-------|------|
| `name` | `string?` |
| `phone` | `string?` |
| `avatar` | `string?` |
| `bio` | `string?` |

```json
{
  "name": "Nguyen Van B",
  "bio": "Hello LiquidNetwork"
}
```

**Response `data`:** owner `UserResponseDto` sau update.

---

### 4.3. `PATCH /api/users/me/drunk-profile`

| | |
|--|--|
| **Auth** | JWT |
| **HTTP** | `200` |

**Request body** (nested bắt buộc key `drunkProfile`)

| Field | Type | Required |
|-------|------|----------|
| `drunkProfile` | `object` | Có |
| `drunkProfile.occupation` | `string?` | Không |
| `drunkProfile.education` | `string?` | Không |
| `drunkProfile.selfIntroduction` | `string?` | Không |

```json
{
  "drunkProfile": {
    "occupation": "Engineer",
    "education": "BKU",
    "selfIntroduction": "Thích networking"
  }
}
```

**Response `data`:** owner `UserResponseDto` (merge partial fields).

---

### 4.4. `PATCH /api/users/me/privacy`

| | |
|--|--|
| **Auth** | JWT |
| **HTTP** | `200` |

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `privacySettings` | `object` | Có |
| `privacySettings.hideProfile` | `boolean?` | Không |
| `privacySettings.hideLevel` | `boolean?` | Không |

```json
{
  "privacySettings": {
    "hideProfile": true,
    "hideLevel": false
  }
}
```

**Response `data`:** owner `UserResponseDto`.

---

### 4.5. `PATCH /api/users/me/tolerance-level`

| | |
|--|--|
| **Auth** | JWT |
| **HTTP** | `200` |

**Request body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `level` | `string` | Có | Enum `LEVEL_1` … `LEVEL_4` |

```json
{
  "level": "LEVEL_2"
}
```

**Response `data`:** owner `UserResponseDto`.

---

### 4.6. `GET /api/users/:id`

| | |
|--|--|
| **Auth** | JWT |
| **Path param** | `id` — Mongo user id |
| **HTTP** | `200` hoặc `404` |

**Request:** không body.

**Response `data`:**

- Owner (`id === requester`): full DTO như `/me`
- Public: không `email` / `privacySettings`; level tùy `hideLevel`

**Lỗi:**

| Code | Khi |
|------|-----|
| `USER_NOT_FOUND` / `NOT_FOUND` | User không tồn tại, soft-deleted, hoặc **hideProfile** với non-owner |

---

### 4.7. `POST /api/users/:id/reviews`

| | |
|--|--|
| **Mô tả** | Tạo peer review cho user `:id` (reviewee) |
| **Auth** | JWT (reviewer = current user) |
| **Path** | `id` = revieweeId |
| **HTTP** | `201` (default POST) |

**Request body** (`CreatePeerReviewBodyDto`)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `sessionId` | `string` | Có | non-empty string |
| `rating` | `number` | Có | 1–5 |
| `comment` | `string?` | Không | |

```json
{
  "sessionId": "session-abc-123",
  "rating": 5,
  "comment": "Good vibe"
}
```

**Response `data` (`PeerReviewResponseDto`)**

| Field | Type |
|-------|------|
| `id` | `string` |
| `reviewerId` | `string` |
| `revieweeId` | `string` |
| `sessionId` | `string` |
| `rating` | `number` |
| `comment` | `string?` |
| `createdAt` | `string` / `Date`? |

```json
{
  "success": true,
  "data": {
    "id": "6650...",
    "reviewerId": "664f...",
    "revieweeId": "664e...",
    "sessionId": "session-abc-123",
    "rating": 5,
    "comment": "Good vibe",
    "createdAt": "2026-07-16T10:00:00.000Z"
  },
  "timestamp": "..."
}
```

**Lỗi tiêu biểu:**

| Code / HTTP | Khi |
|-------------|-----|
| `VALIDATION_ERROR` | Thiếu/sai field body |
| Conflict self-review | reviewer === reviewee |
| `NOT_FOUND` | Reviewee không tồn tại |
| Conflict duplicate | Đã review cùng `sessionId` |

> **Chưa verify:** `sessionId` có tồn tại session thật hay reviewer đã tham gia (Sessions module chưa có).

**Side effect:** cập nhật `averageRating`, `totalReviews` của reviewee.

---

### 4.8. `GET /api/users/:id/reviews`

| | |
|--|--|
| **Mô tả** | Danh sách peer reviews của user |
| **Auth** | JWT |
| **HTTP** | `200` |

**Request:** không body, **chưa có** query pagination.

**Response `data`:** `PeerReviewResponseDto[]`

```json
{
  "success": true,
  "data": [
    {
      "id": "6650...",
      "reviewerId": "664f...",
      "revieweeId": "664e...",
      "sessionId": "session-abc-123",
      "rating": 5,
      "comment": "Good vibe",
      "createdAt": "2026-07-16T10:00:00.000Z"
    }
  ],
  "timestamp": "..."
}
```

**Privacy:** non-owner + target `hideProfile` → `404 USER_NOT_FOUND` (giống profile). Owner luôn xem được.

---

## 5. Module: Drinking Sessions (mock — chưa mount)

**File:** `src/modules/drinking-sessions/drinking-sessions.controller.ts`  
**Base path (dự kiến):** `/api/drinking-sessions`  
**Trạng thái:** Controller + DTO có sẵn; **`DrinkingSessionsModule` không import trong `AppModule`** → **không serve** khi chạy app.  
**Auth code:** Swagger `@ApiBearerAuth` nhưng **không** có `@UseGuards(JwtAuthGuard)`.  
**Logic:** return mock, không ghi DB.

### 5.1. `POST /api/drinking-sessions` *(khi mount)*

**Request body** (`CreateDrinkingSessionDto`)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | `string` | Có | non-empty |
| `location` | `string` | Có | non-empty |
| `maxParticipants` | `number` | Có | 1–20 |
| `startTime` | `string` | Có | ISO date string |
| `note` | `string?` | Không | |

```json
{
  "title": "Friday Hangout",
  "location": "123 Nguyen Hue, Q1, HCMC",
  "maxParticipants": 5,
  "startTime": "2026-07-20T19:00:00Z",
  "note": "BYO snacks"
}
```

**Response mock (handler return):**

```json
{
  "success": true,
  "data": {
    "id": "mock-id",
    "title": "Friday Hangout",
    "location": "123 Nguyen Hue, Q1, HCMC",
    "maxParticipants": 5,
    "startTime": "2026-07-20T19:00:00Z",
    "note": "BYO snacks",
    "status": "SCHEDULED"
  }
}
```

> Khi bật interceptor + mount: client nhận envelope chuẩn với `data` là object session mock (interceptor có thể bóc `data` nếu raw return đã có `{ success, data }`).

---

## 6. Module khác (chưa có endpoint)

| Module folder | HTTP API |
|---------------|----------|
| `chat/` | Chưa |
| `matchmaking/` | Chưa |
| `notifications/` | Chưa |
| `safe-ride/` | Chưa |
| `invitation-queue/` | Chưa |

---

## 7. Ma trận Auth nhanh

| Endpoint | Public | JWT |
|----------|--------|-----|
| `GET /api` | ✓ | |
| `POST /api/auth/register` | ✓ | |
| `POST /api/auth/login` | ✓ | |
| `POST /api/auth/refresh` | ✓ | |
| `POST /api/auth/google` | ✓ | |
| `POST /api/auth/logout` | | ✓ |
| `GET /api/auth/me` | | ✓ |
| `GET/PATCH /api/users/me*` | | ✓ |
| `GET /api/users/:id` | | ✓ |
| `POST/GET /api/users/:id/reviews` | | ✓ |
| `POST /api/drinking-sessions` | mock | (chưa guard, chưa mount) |

---

## 8. Ghi chú tích hợp Frontend

1. **Luôn đọc payload trong `response.data`** (success) và `response.error` (fail).  
2. **Access token** gửi header `Authorization: Bearer ...`.  
3. **Refresh** dùng body, không dùng cookie (hiện tại).  
4. **Password register** tối thiểu **8** ký tự.  
5. **Public profile** không có `email` / `privacySettings`.  
6. **Google login** mặc định **501** — đừng coi là sẵn sàng production.  
7. **Swagger:** `/api/docs` khi `ENABLE_SWAGGER` / development.  
8. **Sessions API thật** chưa có; peer review `sessionId` hiện là string tự do.

---

## 9. Lịch sử tài liệu

| Version | Ngày | Ghi chú |
|---------|------|---------|
| 1.0 | 2026-07-16 | Thống kê toàn bộ endpoint hiện có theo code; format success/error chuẩn Phase 1–2 |

---

*Tài liệu sinh từ source code LiquidNetwork backend. Khi thêm module/route mới, cập nhật file này cho đồng bộ với Swagger.*
