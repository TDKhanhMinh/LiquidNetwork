# Feature: Drunk Profile + Level Tửu Lượng

## Mục tiêu

Hồ sơ nhậu phản ánh **style** và **uy tín** trong cộng đồng: giới thiệu, nghề, privacy, và **4 cấp Tửu Lượng**.

| Level | Tên | Badge tone |
|-------|-----|------------|
| 1 | Nếm Bọt | Neutral |
| 2 | Vui Vẻ | Info/blue |
| 3 | Chiến Thần | Primary amber |
| 4 | Bất Tử | Gradient glow |

Backend: module `users` (IUser: `drunkProfile`, `alcoholToleranceLevel`, stats review…).

---

## User flows

1. **Onboarding** — setup tên, avatar, drunk intro, level tự chọn/gợi ý.
2. **Xem profile** — mình / người khác (respect privacy: `hideProfile`, `hideLevel`).
3. **Sửa profile** — RHF + Zod; mutation PATCH.
4. **Peer review reflection** — sau session, rating/stats cập nhật (read-only metrics).

---

## Domain types (gợi ý)

```ts
type AlcoholLevel = "nem_bot" | "vui_ve" | "chien_than" | "bat_tu";
// hoặc map enum backend

type DrunkProfile = {
  occupation?: string;
  education?: string;
  selfIntroduction?: string;
};

type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  drunkProfile: DrunkProfile;
  alcoholLevel: AlcoholLevel;
  privacy: { hideProfile: boolean; hideLevel: boolean };
  stats: {
    sessionsJoined: number;
    averageRating: number;
    totalReviews: number;
    invitationAcceptRate: number;
  };
};
```

---

## UI

- **Profile header:** Avatar (level ring) + name + `AlcoholLevelBadge`
- **Drunk intro card:** quote-style selfIntroduction
- **Stats row:** sessions · rating · accept rate (tooltip giải thích)
- **Privacy toggles:** copy rõ “Ẩn level với người lạ”
- Empty intro: “Chưa viết gì — thêm vài dòng để bàn dễ match hơn”

### Badge rules

- Luôn có text, không chỉ màu.
- Profile người khác + `hideLevel` → ẩn hoặc “—” .

---

## Data

- `userApi.getMe` / `getById`
- Query keys: `userKeys.me()`, `userKeys.detail(id)`
- Mutation update → invalidate me + detail
- Form schema Zod: max length intro (vd 300), trim

---

## Best Practices

- Level names **luôn** tiếng Việt user-facing.
- Không spoof level phía client (chỉ hiển thị server).
- Ảnh avatar compress trước upload.
- Accessibility label badge: “Cấp tửu lượng Chiến Thần”.

## Anti-patterns cần tránh

- Hard-code 3 level (thiếu Bất Tử).
- Public raw `alcoholToleranceLevel` enum Anh không map.
- Cho sửa `averageRating` local.
- Profile edit không validate, crash submit.
