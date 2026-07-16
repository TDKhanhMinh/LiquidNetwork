# Matching Module (Phase 1)

Bộ não xếp hạng ứng viên cho **Invitation Queue** của LiquidNetwork.

## Mục tiêu

Khi creator “Tìm người nhậu”, API trả danh sách ứng viên đã score + sort trong pool giới hạn, để FE (hoặc bước sau) đưa `inviteeIds` vào:

```http
POST /api/invitation-queue
```

Phase 1 **không** tự tạo queue.

## API (JWT)

| Method | Path | Mô tả |
|--------|------|--------|
| `POST` | `/api/matching/candidates` | Sinh danh sách ranked |
| `POST` | `/api/matching/score` | Score 1-1 (debug / preview) |
| `GET` | `/api/matching/preferences` | Preference (default nếu chưa có) |
| `PUT` | `/api/matching/preferences` | Cập nhật preference |

## Công thức score (Phase 1)

Không có geo trên User → **không tính Distance**. Weights:

```
Score =
  LevelScore      * 0.40 +
  ModeScore       * 0.20 +
  ReputationScore * 0.20 +
  ActivityScore   * 0.10 +
  OccupationScore * 0.10
```

Scoring pure functions sống ở **domain** (`domain/services/score-calculators.ts`) — Application không phụ thuộc Infrastructure.

Nguồn tín hiệu:

| Component | Source |
|-----------|--------|
| Level | `user.alcoholToleranceLevel` |
| Mode | request / preference (`MatchingMode`) — Phase 1 base = 1.0 |
| Reputation | `averageRating` + `totalReviews` (cold-start damping) |
| Activity | `updatedAt` decay |
| Occupation | soft match chỉ khi `mode = NETWORKING` và có preferred occupations |

### Rate limits

| Endpoint | Limit |
|----------|--------|
| `POST /matching/candidates` | 30 / phút / user |
| `POST /matching/score` | 60 / phút / user |

### History fallback

Nếu exclude theo matching history làm pool nhỏ hơn 50% `limit` yêu cầu, hệ thống **retry** chỉ với `excludeUserIds` của client (bỏ history) và set `historyFallbackApplied: true`.

## Handoff Invitation Queue

1. `POST /api/matching/candidates` → `candidates[].id` theo thứ tự score.
2. User có thể reorder / bớt.
3. `POST /api/invitation-queue` với `inviteeIds` (max 20) + `timeoutSeconds`.

Text search thủ công vẫn nằm ở:

- `GET /api/invitation-queue/candidates?q=`
- `GET /api/invitation-queue/candidates/suggestions`

## Collections

- `matching_preferences` — 1 doc / user
- `matching_histories` — snapshot mỗi lần generate (best-effort write)

## Limitations (Phase 1)

- Không filter khoảng cách (chưa location / 2dsphere)
- Không gender / age
- Mode chưa gắn profile riêng của candidate
- History exclude chỉ dựa trên matching runs, chưa deep invite reject graph

## Phase 2 gợi ý

- User geo + Distance weight
- `lastActiveAt` thật
- Tích hợp sâu peer-review / “nhân phẩm lúc say”
- Optional: smart suggestions trong invitation-queue delegate sang module này
