# Feature: Safe Ride — “Đã uống không lái”

## Mục tiêu

Giảm rủi ro lái xe sau khi uống: **nudge rõ**, **CTA gọi xe nhanh**, không chôn trong settings.

---

## Triggers UX

| Thời điểm | Hành vi |
|-----------|---------|
| Session `ended` | Banner/modal Safe Ride |
| User self-tag “Đã uống” | Sheet gợi ý |
| Đêm khuya + session live lâu | Soft reminder (không spam) |
| Từ profile / tab | Entry chủ động |

---

## User flow

```
Thấy “Đã uống — đừng lái”
  → [Gọi xe ngay] → deep link Grab/Be/Gojek / partner SDK / tel:
  → [Tôi có người chở] → dismiss + optional log
  → [Nhắc lại sau 15p] → local schedule (nếu có)
```

---

## UI

- Màu **danger/warning**, icon shield.
- Headline: **“Đã uống không lái”**
- Sub: “Gọi xe 2 phút, về nhà an toàn hơn nhiều.”
- Primary CTA full-width lớn (48–52 height).
- Secondary text button dismiss.

**Không** dùng humor kiểu “say vẫn lái được”.

---

## Data

- Optional API: log intent `POST /safe-ride/intent` (analytics).
- Deep links config theo build flavor VN.
- Không yêu cầu backend để **hiện** CTA (fail-open safety).

---

## Best Practices

- 1 tap tới app gọi xe (nếu cài) / store fallback.
- Tôn trọng dismiss nhưng hiện lại khi end session sau.
- i18n rõ, không legal wall dài che CTA.

## Anti-patterns cần tránh

- Nút nhỏ góc dưới.
- Chỉ hiện 1 lần mãi mãi sau dismiss đầu tiên khi user hay end session.
- Animation vui che warning.
- Thu thập location không cần thiết không xin permission rõ.
