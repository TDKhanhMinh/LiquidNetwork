# LiquidNetwork Backend — Thống kê & mô tả Request / Response

> **Phiên bản tài liệu:** 2.0  
> **Nguồn:** scan code `src/` (controllers, DTOs, `AppModule`, interceptors, filters) — 16/07/2026  
> **Base URL:** `http://localhost:{PORT}/api` (mặc định `PORT=3000`)  
> **Swagger (dev):** `http://localhost:{PORT}/api/docs` (khi `ENABLE_SWAGGER` / development)

---

## 1. Tổng quan

### 1.1. Thống kê endpoint (theo code hiện có)

| Module | Controller path | Số endpoint | Mounted `AppModule` | Auth (JWT) |
|--------|-----------------|-------------|---------------------|------------|
| **App** (root) | `/` | 1 | Có | Không |
| **Auth** | `/auth` | 6 | Có | 2/6 (`logout`, `me`) |
| **Users** | `/users` | 6 | Có | Tất cả |
| **Peer Reviews** | `/users/:id/reviews` | 2 | Có (UsersModule) | Tất cả |
| **Matching** | `/matching` | 4 | Có | Tất cả |
| **Invitation Queue** | `/invitation-queue` | 10 | Có | Tất cả |
| **Drinking Sessions** | `/drinking-sessions` | 1 | **Không** (mock, controller không đăng ký) | Swagger Bearer; **chưa `@UseGuards`** |
| Chat / Notifications / Safe-ride / Friends / Monetization | — | 0 | Chưa có HTTP | — |

| | Số lượng |
|--|----------|
| Endpoint **định nghĩa** trong code | **30** |
| Endpoint **serve khi app chạy** | **29** (trừ `POST /drinking-sessions`) |

**Modules mount trong `src/app.module.ts`:** `AuthModule`, `UsersModule`, `InvitationQueueModule`, `MatchingModule` (+ shared config/mongoose/queue/throttler).

### 1.2. Convention chung

| Mục | Mô tả |
|-----|--------|
| Global prefix | `api` → route HTTP = `/api/...` |
| Content-Type | `application/json` (body) |
| Auth header | `Authorization: Bearer <accessToken>` |
| Validation | Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`, `enableImplicitConversion` |
| Success envelope | Global `ResponseInterceptor` |
| Error envelope | Global `AllExceptionsFilter` |
| CORS | Reflect origin hoặc list `CORS_ORIGIN`; credentials bật |

### 1.3. Success response (chuẩn)

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
| `success` | `boolean` | Có | `true` khi HTTP 2xx qua interceptor |
| `data` | `any` | Có | Payload nghiệp vụ |
| `message` | `string` | Không | Khi handler trả wrapper có `message` |
| `meta` | `object` | Không | Pagination / metadata |
| `timestamp` | `string` (ISO) | Có | Thời điểm response |

> **Lưu ý:** Controller nên return plain object/DTO. Nếu return `{ success, data }` với ≤2 key, interceptor có thể bóc `data` (tránh double-wrap). `DELETE` 204 thường không body.

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
| `error.message` | `string` | Mô tả |
| `error.details` | `any` | Optional |
| `timestamp` | `string` | ISO |
| `path` | `string` | URL request |

**Production:** HTTP ≥ 500 → message generic, không lộ stack.

### 1.5. Enums dùng chung

**AlcoholToleranceLevel**

| Value | Ý nghĩa (product) |
|-------|-------------------|
| `LEVEL_1` | Nếm Bọt |
| `LEVEL_2` | Vui Vẻ |
| `LEVEL_3` | Chiến Thần |
| `LEVEL_4` | Bất Tử |

**MatchingMode**

| Value |
|-------|
| `CASUAL` · `NETWORKING` · `GIAI_SAU` · `DEBATE` · `UONG_DAM` |

### 1.6. Mã lỗi thường gặp

| HTTP | `error.code` | Khi nào |
|------|--------------|---------|
| 400 | `VALIDATION_ERROR` | Body/query sai class-validator |
| 400 | `INVALID_DATA_TYPE` | Mongo `CastError` |
| 400 | `INVALID_INVITEES` / `NOT_YOUR_TURN` / `INVALID_CANDIDATE` / `INVALID_PREFERRED_MODES` / … | Nghiệp vụ matching/queue |
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` / `INVALID_TOKEN` | Auth / JWT |
| 401 | `INVALID_REFRESH_TOKEN` / `REFRESH_TOKEN_EXPIRED` / `TOKEN_REUSE_DETECTED` | Refresh |
| 403 | `FORBIDDEN_QUEUE_ACCESS` | Queue host/participant |
| 404 | `USER_NOT_FOUND` / `NOT_FOUND` / `QUEUE_NOT_FOUND` / `INVITATION_NOT_FOUND` | Resource / ẩn profile |
| 409 | `EMAIL_ALREADY_EXISTS` / `ALREADY_HAS_ACTIVE_QUEUE` / `QUEUE_NOT_ACTIVE` | Conflict |
| 429 | `RATE_LIMIT_EXCEEDED` | Throttle |
| 501 | `GOOGLE_AUTH_DISABLED` | Google login tắt |
| 500 | `INTERNAL_SERVER_ERROR` / `REGISTRATION_FAILED` / `QUEUE_CREATE_FAILED` | Hệ thống |

### 1.7. Rate limits (endpoint-level)

| Endpoint | Limit |
|----------|--------|
| `POST /api/invitation-queue` | 10 / giờ / user |
| `POST /api/invitation-queue/:queueId/respond` | 30 / phút / user |
| `POST /api/matching/candidates` | 30 / phút / user |
| `POST /api/matching/score` | 60 / phút / user |

(Ngoài ra có throttler global nếu cấu hình trong `RateLimiterModule`.)

---

## 2. Module: App (root)

**File:** `src/app.controller.ts`  
**Base:** `/api`

### 2.1. `GET /api`

| | |
|--|--|
| **Mô tả** | Health / hello |
| **Auth** | Không |
| **Status** | `200` |
| **`data`** | `"Hello World!"` |

---

## 3. Module: Auth

**File:** `src/modules/auth/presentation/http/auth.controller.ts`  
**Base:** `/api/auth`  
**Mounted:** Có

### Thống kê

| Method | Path | Auth | Status | Mô tả |
|--------|------|------|--------|--------|
| `POST` | `/api/auth/register` | Không | `201` | Đăng ký + tokens |
| `POST` | `/api/auth/login` | Không | `200` | Đăng nhập |
| `POST` | `/api/auth/refresh` | Không | `200` | Đổi access bằng refresh |
| `POST` | `/api/auth/google` | Không | `200` / `501` | Google OAuth (thường disabled) |
| `POST` | `/api/auth/logout` | JWT | `200` | Logout (revoke refresh optional) |
| `GET` | `/api/auth/me` | JWT | `200` | Payload JWT hiện tại (`id`, `email`, `name`, …) |

### 3.1. `POST /api/auth/register`

**Body**

| Field | Type | Rule |
|-------|------|------|
| `name` | string | required |
| `email` | string | email |
| `password` | string | min **8** |

**`data` (typical):** `{ user, accessToken, refreshToken }` (shape từ use case register).

### 3.2. `POST /api/auth/login`

**Body:** `{ email, password }`  
**`data`:** tokens + user info tương tự login use case.

### 3.3. `POST /api/auth/refresh`

**Body:** `{ refreshToken: string }`  
**`data`:** cặp token mới.

### 3.4. `POST /api/auth/google`

**Body:** theo `GoogleLoginDto` (id token / credential).  
Mặc định có thể trả **501** `GOOGLE_AUTH_DISABLED`.

### 3.5. `POST /api/auth/logout`

**Auth:** JWT  
**Body (optional):** `{ refreshToken?: string }`  
**`data`:** kết quả logout use case.

### 3.6. `GET /api/auth/me`

**Auth:** JWT  
**`data`:** object user từ JWT strategy (không full profile DB — dùng `GET /users/me` cho profile đầy đủ).

---

## 4. Module: Users

**File:** `src/modules/users/presentation/http/users.controller.ts`  
**Base:** `/api/users`  
**Auth:** JWT (toàn controller)  
**Mounted:** Có

### Thống kê

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/api/users/me` | Profile owner (có email, privacy, level) |
| `PATCH` | `/api/users/me` | Cập nhật basic: name, phone, avatar, bio |
| `PATCH` | `/api/users/me/drunk-profile` | occupation, education, selfIntroduction |
| `PATCH` | `/api/users/me/privacy` | hideProfile, hideLevel |
| `PATCH` | `/api/users/me/tolerance-level` | `level`: AlcoholToleranceLevel |
| `GET` | `/api/users/:id` | Public profile (privacy: ẩn profile → 404; ẩn level → omit level) |

### 4.1. User response shape (`UserResponseDto`)

| Field | Owner | Public (other) |
|-------|-------|----------------|
| `id`, `name`, `phone?`, `avatar?`, `bio?` | ✓ | ✓ |
| `drunkProfile` | ✓ | ✓ |
| `sessionsJoined`, `invitationAcceptRate`, `averageRating`, `totalReviews` | ✓ | ✓ |
| `email` | ✓ | ✗ |
| `privacySettings` | ✓ | ✗ |
| `alcoholToleranceLevel` | ✓ | Chỉ nếu `!hideLevel` |

### 4.2. Request bodies

**`PATCH /me`**

```json
{ "name?": "...", "phone?": "...", "avatar?": "...", "bio?": "..." }
```

**`PATCH /me/drunk-profile`**

```json
{
  "drunkProfile": {
    "occupation?": "...",
    "education?": "...",
    "selfIntroduction?": "..."
  }
}
```

**`PATCH /me/privacy`**

```json
{
  "privacySettings": {
    "hideProfile?": false,
    "hideLevel?": false
  }
}
```

**`PATCH /me/tolerance-level`**

```json
{ "level": "LEVEL_2" }
```

---

## 5. Module: Peer Reviews

**File:** `src/modules/users/presentation/http/peer-reviews.controller.ts`  
**Base:** `/api/users/:id/reviews`  
**Auth:** JWT  
**Mounted:** Có (UsersModule)

| Method | Path | Mô tả |
|--------|------|--------|
| `POST` | `/api/users/:id/reviews` | Tạo review cho user `:id` (reviewee = path) |
| `GET` | `/api/users/:id/reviews` | List reviews (respect hideProfile) |

### 5.1. `POST` body

| Field | Type | Rule |
|-------|------|------|
| `sessionId` | string | required (string tự do — sessions module chưa thật) |
| `rating` | number | 1–5 |
| `comment` | string? | optional |

### 5.2. Review response

```json
{
  "id": "...",
  "reviewerId": "...",
  "revieweeId": "...",
  "sessionId": "...",
  "rating": 5,
  "comment": "...",
  "createdAt": "..."
}
```

---

## 6. Module: Matching

**Files:**  
- Controller: `src/modules/matching/presentation/http/matching.controller.ts`  
- README: `src/modules/matching/README.md`  
**Base:** `/api/matching`  
**Auth:** JWT (toàn controller)  
**Mounted:** Có (`MatchingModule`)

### Mục tiêu Phase 1

Sinh danh sách ứng viên **đã score + rank** để FE đưa vào Invitation Queue (`inviteeIds`).  
**Không** auto-create queue. **Không** filter geo (User chưa có location).

### Thống kê

| Method | Path | Rate limit | Mô tả |
|--------|------|------------|--------|
| `POST` | `/api/matching/candidates` | 30/phút | Generate ranked list |
| `POST` | `/api/matching/score` | 60/phút | Score 1-1 |
| `GET` | `/api/matching/preferences` | — | Prefs (default nếu chưa lưu) |
| `PUT` | `/api/matching/preferences` | — | Upsert prefs |

### Score formula (Phase 1)

```
Score (0–100) =
  LevelScore      * 0.40 +
  ModeScore       * 0.20 +
  ReputationScore * 0.20 +
  ActivityScore   * 0.10 +
  OccupationScore * 0.10
```

| Component | Nguồn |
|-----------|--------|
| Level | `alcoholToleranceLevel` (gap 0–3) |
| Mode | base 1.0 Phase 1 |
| Reputation | `averageRating` + `totalReviews` (cold-start) |
| Activity | `updatedAt` decay |
| Occupation | chỉ khi `mode=NETWORKING` + có preferred occupations |

**Pool:** max 200 user pre-filter → top N (default/max 20).  
**History fallback:** nếu exclude history làm pool &lt; 50% `limit` → retry không history; `historyFallbackApplied: true`.

### 6.1. `POST /api/matching/candidates`

**Body (all optional trừ khi cần override)**

| Field | Type | Rule |
|-------|------|------|
| `mode` | MatchingMode | |
| `preferredAlcoholLevels` | AlcoholToleranceLevel[] | max 4 |
| `preferredOccupations` | string[] | max 10, mỗi ≤80 |
| `excludeUserIds` | MongoId[] | max 100 |
| `limit` | int | 1–20 |
| `excludeRecentDays` | int | 0–90 |

**`data`**

```json
{
  "mode": "CASUAL",
  "totalScored": 42,
  "historyFallbackApplied": false,
  "candidates": [
    {
      "id": "...",
      "name": "...",
      "avatar": "...",
      "alcoholToleranceLevel": "LEVEL_2",
      "occupation": "Engineer",
      "score": 87.5,
      "breakdown": {
        "level": 100,
        "mode": 100,
        "reputation": 80,
        "activity": 100,
        "occupation": 100
      }
    }
  ]
}
```

> `alcoholToleranceLevel` omit nếu candidate `hideLevel`.

**Handoff queue**

1. Lấy `candidates[].id` (đã sort score giảm dần)  
2. User có thể reorder/bớt  
3. `POST /api/invitation-queue` với `inviteeIds` + `timeoutSeconds`

### 6.2. `POST /api/matching/score`

**Body**

| Field | Type | Rule |
|-------|------|------|
| `candidateId` | MongoId | required |
| `mode` | MatchingMode? | |
| `preferredOccupations` | string[]? | |

**`data`:** `{ requesterId, candidateId, mode, score, breakdown, candidate }`

### 6.3. `GET /api/matching/preferences`

**`data`**

| Field | Type | Default (chưa lưu DB) |
|-------|------|------------------------|
| `userId` | string | requester |
| `preferredModes` | MatchingMode[] | `[CASUAL]` |
| `preferredAlcoholLevels` | string[] | `[]` |
| `preferredOccupations` | string[] | `[]` |
| `maxDistanceKm` | number\|null | `15` (chưa apply Phase 1) |
| `maxCandidates` | number | `20` |
| `excludeRecentDays` | number | `7` |

### 6.4. `PUT /api/matching/preferences`

**Body (partial):** các field prefs; nếu gửi `preferredModes` → **tối thiểu 1** phần tử (`ArrayMinSize(1)` + UC reject empty).

---

## 7. Module: Invitation Queue

**File:** `src/modules/invitation-queue/presentation/http/invitation-queue.controller.ts`  
**Base:** `/api/invitation-queue`  
**Auth:** JWT  
**Mounted:** Có  
**Background:** BullMQ `invitation-timeout`

### 7.0. State machine (tóm tắt)

| Queue `status` | Ý nghĩa |
|----------------|---------|
| `active` | Đang mời tuần tự |
| `matched` | Có accept |
| `completed` | Hết list, không accept |
| `cancelled` | Host hủy |
| `draft` | Dự phòng (create hiện start `active`) |

| Participant `status` | `pending` · `active` · `accepted` · `rejected` · `timeout` · `skipped` |
| Invitation `status` | `pending` · `accepted` · `rejected` · `timeout` · `cancelled` |

```text
CREATE  → active, participants[0]=active, schedule timeout job
ACCEPT  → matched, cancel job
REJECT / TIMEOUT → advance next pending or completed/matched
CANCEL  → cancelled; pending invites cancelled
```

**Rules:** 1 active queue / host · invitees 1–20 · timeout 15–600s · respond chỉ current invitee · cancel/DELETE chỉ host.

### Thống kê

| Method | Path | Rate limit | Ghi chú |
|--------|------|------------|---------|
| `POST` | `/api/invitation-queue` | 10/giờ | Create + start |
| `GET` | `/api/invitation-queue/me` | — | Active queue host hoặc `null` |
| `GET` | `/api/invitation-queue/history` | — | `?page&limit` (page≥1, limit 1–100; default page=1 limit=50 ở controller) |
| `GET` | `/api/invitation-queue/candidates/suggestions` | — | Gợi ý text (không scoring Matching) |
| `GET` | `/api/invitation-queue/candidates` | — | `?q=` search name/email/occupation |
| `GET` | `/api/invitation-queue/invitations/:invitationId` | — | Flat invitation |
| `GET` | `/api/invitation-queue/:queueId` | — | Host hoặc participant |
| `POST` | `/api/invitation-queue/:queueId/respond` | 30/phút | `{ accept: boolean }` |
| `POST` | `/api/invitation-queue/:queueId/cancel` | — | Host |
| `DELETE` | `/api/invitation-queue/:queueId` | — | Host = cancel, **HTTP 204** |

> Route tĩnh (`me`, `history`, `candidates`, `invitations/...`) **trước** `:queueId`.

### 7.1. `POST /api/invitation-queue`

**Body**

| Field | Type | Rule |
|-------|------|------|
| `title` | string? | max 120 |
| `message` | string? | max 500 |
| `timeoutSeconds` | int | **15–600** required |
| `inviteeIds` | MongoId[] | 1–20, ordered priority |

**`data`:** `InvitationQueue` response (xem 7.4).

### 7.2. Candidates (text search — không Matching score)

**`GET /candidates?q=`** → `QueueUserRef[]`  
**`GET /candidates/suggestions`** → tối đa ~6 user gần đây  

```json
{ "id", "name", "avatar?", "alcoholToleranceLevel?", "occupation?" }
```

### 7.3. Respond / Cancel

**Respond body:** `{ "accept": true | false }`  
**Cancel / DELETE:** không body; DELETE → 204.

### 7.4. InvitationQueue response shape

| Field | Type |
|-------|------|
| `id`, `hostId`, `hostName`, `hostAvatar?` | string |
| `title?`, `message?` | string |
| `status` | string |
| `timeoutSeconds`, `currentIndex` | number |
| `participants[]` | userId, name, avatar?, level?, occupation?, order, status, invitedAt?, respondedAt? |
| `expiresAt`, `createdAt`, `updatedAt?`, `completedAt` | ISO string / null |

Field nội bộ `generation` **không** expose.

### 7.5. History response

```json
{
  "sent": [ /* InvitationResponseDto */ ],
  "received": [ /* ... */ ],
  "meta": {
    "page": 1,
    "limit": 50,
    "sentTotal": 0,
    "receivedTotal": 0
  }
}
```

---

## 8. Module: Drinking Sessions (mock — **chưa mount**)

**File:** `src/modules/drinking-sessions/drinking-sessions.controller.ts`  
**Mounted:** **Không** trong `AppModule` → runtime: `Cannot GET/POST /api/drinking-sessions`

| Method | Path | Auth code | Ghi chú |
|--------|------|-----------|---------|
| `POST` | `/api/drinking-sessions` | Swagger Bearer, **không Guard** | Mock return `{ success, data: { id: 'mock-id', ...dto, status: 'SCHEDULED' } }` |

**Body (khi mount):** `title`, `location`, `maxParticipants` (1–20), `startTime` (ISO), `note?`

**Không có** `GET /api/drinking-sessions` trong code (FE gọi sẽ 404 kể cả khi mount controller hiện tại).

---

## 9. Module / route FE gọi nhưng **chưa có backend**

Các request sau xuất hiện log `Cannot GET ...` khi FE home poll — **đúng với codebase hiện tại**:

| Path FE | Backend |
|---------|---------|
| `GET /api/notifications/unread-count` | Folder `notifications/` trống, 0 endpoint |
| `GET /api/chat/unread-count` | Folder `chat/` trống |
| `GET /api/drinking-sessions` | Không có GET; module chưa mount |
| `GET /api/friends` | Không có module |
| `GET /api/monetization/ads?placement=...` | Không có module |
| `safe-ride` | Folder trống |

**Khuyến nghị FE:** ignore/feature-flag 404. **Backend:** implement khi roadmap tới.

---

## 10. Ma trận Auth nhanh

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
| `POST /api/matching/candidates` | | ✓ |
| `POST /api/matching/score` | | ✓ |
| `GET /api/matching/preferences` | | ✓ |
| `PUT /api/matching/preferences` | | ✓ |
| `POST /api/invitation-queue` | | ✓ |
| `GET /api/invitation-queue/me` | | ✓ |
| `GET /api/invitation-queue/history` | | ✓ |
| `GET /api/invitation-queue/candidates*` | | ✓ |
| `GET /api/invitation-queue/invitations/:id` | | ✓ |
| `GET /api/invitation-queue/:queueId` | | ✓ |
| `POST /api/invitation-queue/:queueId/respond` | | ✓ |
| `POST /api/invitation-queue/:queueId/cancel` | | ✓ |
| `DELETE /api/invitation-queue/:queueId` | | ✓ |
| `POST /api/drinking-sessions` | mock | (chưa mount / chưa guard) |

---

## 11. Ghi chú tích hợp Frontend

1. Luôn đọc payload trong `response.data` (success) và `response.error` (fail) sau envelope.  
2. Access token: `Authorization: Bearer ...`.  
3. Refresh dùng body, không cookie.  
4. Password register tối thiểu **8** ký tự.  
5. Public profile **không** có `email` / `privacySettings`.  
6. Google login có thể **501**.  
7. Swagger: `/api/docs` (dev).  
8. Matching → Queue: `POST /matching/candidates` rồi `POST /invitation-queue` với `inviteeIds`.  
9. Text search queue vẫn: `/invitation-queue/candidates?q=` (không score).  
10. Queue: poll `expiresAt` / detail; realtime Socket.io **chưa**.  
11. Redis **cần** cho create queue (BullMQ).  
12. 429 → `RATE_LIMIT_EXCEEDED`.  
13. Các unread-count / friends / ads / GET sessions: **404 cho đến khi implement** — không coi là regression Matching.

---

## 12. Flow gợi ý (Matching + Queue)

```text
[Login] → JWT
    ↓
PUT/GET /matching/preferences   (optional)
    ↓
POST /matching/candidates       → ranked ids
    ↓
(user chọn / reorder)
    ↓
POST /invitation-queue          { inviteeIds, timeoutSeconds, title?, message? }
    ↓
poll GET /invitation-queue/me | GET /:queueId
invitee: POST /:queueId/respond { accept }
host: POST /:queueId/cancel | DELETE /:queueId
```

---

## 13. Lịch sử tài liệu

| Version | Ngày | Ghi chú |
|---------|------|---------|
| 1.0 | 2026-07-16 | Thống kê endpoint ban đầu |
| 1.1 | 2026-07-16 | Invitation Queue chi tiết |
| 1.2 | 2026-07-16 | Matching Phase 1 (4 endpoint) |
| **2.0** | **2026-07-16** | **Full rescan code:** Matching (throttle, formula, fallback), Users/Auth/Peer shapes, FE 404 inventory, flow handoff, stats 29 serve / 30 defined |

---

*Tài liệu sinh từ source LiquidNetwork backend. Khi thêm controller/module, cập nhật file này và Swagger cho đồng bộ.*
