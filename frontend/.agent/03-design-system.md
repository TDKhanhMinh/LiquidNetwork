# 03 — Design System: “Nhậu đêm” (Dark-first)

## Tinh thần

- **Dark mode first**: nền tối, ánh sáng vàng hổ phách / cam rượu như đèn quán.
- Cảm giác **vui, ấm, có nhịp** — không neon chói, không “casino”.
- Typography **hỗ trợ tiếng Việt** tốt (dấu thanh rõ).
- Micro-interaction **mượt** (Reanimated), feedback tay rõ khi bấm Accept/Reject.

---

## Color palette

### Semantic tokens (dùng trong code)

| Token | Light (secondary) | Dark (primary target) | Vai trò |
|-------|-------------------|------------------------|---------|
| `background` | `#FAF7F2` | `#0C0A09` | Nền app |
| `background-elevated` | `#FFFFFF` | `#1C1917` | Card, sheet |
| `background-muted` | `#F5F0E8` | `#292524` | Input, chip bg |
| `foreground` | `#1C1917` | `#FAFAF9` | Text chính |
| `foreground-muted` | `#78716C` | `#A8A29E` | Secondary text |
| `border` | `#E7E5E4` | `#44403C` | Viền |
| **`primary`** | `#D97706` | `#F59E0B` | Vàng hổ phách — CTA chính |
| **`primary-foreground`** | `#1C1917` | `#1C1917` | Text trên primary |
| **`secondary`** | `#1E3A5F` | `#3B82F6` | Xanh dương đậm / accent |
| `secondary-foreground` | `#F8FAFC` | `#F8FAFC` | |
| `success` | `#16A34A` | `#22C55E` | Accept, online |
| `warning` | `#EA580C` | `#FB923C` | Timeout sắp hết |
| `danger` | `#DC2626` | `#F87171` | Reject, error, safe alert |
| `info` | `#0284C7` | `#38BDF8` | Tips |

### Neutral scale (nền “nhậu đêm”)

Thang stone/warm — tránh xám lạnh máy tính:

| Token | Dark hex | Light hex | Dùng |
|-------|----------|-----------|------|
| `neutral-950` | `#0C0A09` | — | App background |
| `neutral-900` | `#1C1917` | — | Elevated surface |
| `neutral-800` | `#292524` | — | Muted / input |
| `neutral-700` | `#44403C` | — | Border |
| `neutral-500` | `#78716C` | `#78716C` | Muted icon |
| `neutral-400` | `#A8A29E` | `#A8A29E` | Secondary text (dark) |
| `neutral-100` | `#F5F5F4` | `#F5F5F4` | Text primary on dark / light surfaces |
| `neutral-50` | `#FAFAF9` | `#FAFAF9` | Foreground on dark |

Semantic `background` / `foreground` / `border` map vào thang neutral trên.

### Brand accents (nhậu)

| Token | Hex (dark) | Dùng cho |
|-------|------------|----------|
| `amber-glow` | `#FBBF24` | Glow countdown, badge Bất Tử |
| `wine` | `#9F1239` | Accent hiếm, peer review harsh |
| `foam` | `#FEF3C7` | Text highlight nhẹ |

### Level Tửu Lượng colors

| Level | Tên | Token / màu gợi ý |
|-------|-----|-------------------|
| 1 | Nếm Bọt | `#A8A29E` (neutral sáng) |
| 2 | Vui Vẻ | `#38BDF8` (secondary/info) |
| 3 | Chiến Thần | `#F59E0B` (primary) |
| 4 | Bất Tử | Gradient `amber-glow` → `#F97316` + subtle glow |

**Contrast:** text trên primary đạt WCAG AA tối thiểu; danger/success không chỉ dựa vào màu (có icon + label).

### NativeWind mapping (ví dụ)

```js
// tailwind.config — theme.extend.colors
primary: { DEFAULT: "#F59E0B", foreground: "#1C1917" },
secondary: { DEFAULT: "#1E3A5F", foreground: "#F8FAFC" },
// ... semantic tokens
```

Không hard-code hex trong JSX nếu đã có token class (`bg-primary`, `text-danger`).

---

## Typography

### Font

- Ưu tiên: **Inter** / **Be Vietnam Pro** / system font có Vietnamese coverage tốt.
- Expo: load font trong root layout; fallback `System`.

### Scale (mobile)

| Token | Size | Line height | Weight | Dùng |
|-------|------|-------------|--------|------|
| `display` | 32 | 40 | 700 | Hero, empty title |
| `h1` | 28 | 36 | 700 | Screen title |
| `h2` | 22 | 28 | 600 | Section |
| `h3` | 18 | 24 | 600 | Card title |
| `body` | 16 | 24 | 400 | Nội dung |
| `body-sm` | 14 | 20 | 400 | Meta, helper |
| `caption` | 12 | 16 | 500 | Badge, timestamp |
| `mono` | 14 | 20 | 500 | Countdown số |

**Tiếng Việt:** line-height ≥ 1.4 cho body; tránh `letter-spacing` âm mạnh (dấu bị chạm).

### Tone copy

- Câu ngắn, động từ rõ: “Chấp nhận lời mời”, “Bỏ qua”.
- Countdown: “Còn **0:42** — quyết định đi!”
- Error: “Mạng lag rồi, thử lại nha” thay vì `NETWORK_ERROR`.

---

## Spacing — 4pt grid

| Token | px | Dùng |
|-------|-----|------|
| `0.5` | 2 | Hairline tweak |
| `1` | 4 | Icon gap nhỏ |
| `2` | 8 | Chip padding |
| `3` | 12 | Compact list |
| `4` | 16 | Default padding màn |
| `5` | 20 | |
| `6` | 24 | Section gap |
| `8` | 32 | Block separation |
| `10` | 40 | |
| `12` | 48 | Bottom CTA safe |

**Screen padding:** horizontal `16` (mobile), bottom inset `+ tab bar + safe area`.

---

## Radius, border, elevation

| Token | Value | Dùng |
|-------|-------|------|
| `radius-sm` | 8 | Chip, input |
| `radius-md` | 12 | Button, card nhỏ |
| `radius-lg` | 16 | Card chính |
| `radius-xl` | 24 | Sheet, modal |
| `radius-full` | 9999 | Avatar, pill |

**Border:** `1px` `border` token; focus ring `2px` primary/50.

**Shadow / elevation (iOS + Android):**

| Level | Ý |
|-------|---|
| `e0` | Flat |
| `e1` | Card nhẹ |
| `e2` | Floating button / toast |
| `e3` | Modal |

Dark mode: shadow mềm + `border` thay vì shadow đậm (Android elevation vừa phải).

---

## Component tokens

### Button

| Variant | Style | Khi dùng |
|---------|-------|----------|
| `primary` | bg-primary, text dark | CTA chính (Accept, Join) |
| `secondary` | bg-secondary | Networking / secondary CTA |
| `outline` | border + transparent | Hủy, phụ |
| `ghost` | text only | Nav tertiary |
| `danger` | bg-danger/15 text-danger | Reject, Leave |
| `success` | bg-success | Confirm positive hiếm |

Sizes: `sm` h-36 · `md` h-44 · `lg` h-52 (min touch **44**).

Loading: spinner + disable double-tap.  
Pressed: scale `0.97` (Reanimated), opacity 0.9.

### Card

- bg `background-elevated`, radius-lg, padding 16, border subtle
- Pressable card: feedback ripple/scale
- Session card: header (host avatar + level badge) + meta + CTA

### Badge — Level Tửu Lượng

- Pill + icon nhỏ + label (“Chiến Thần”)
- Level 4: subtle glow pulse chậm (2.4s loop), **không** flash động kinh

### Avatar

| Prop | Ý |
|------|---|
| `size` | sm 32 / md 40 / lg 56 / xl 80 |
| `status` | online / offline / in-session / “tipsy” (glow amber mỏng) |
| `levelRing` | viền màu theo alcohol level |

Trạng thái “say/tipsy”: **gợi ý vui**, không chế giễu; có thể tắt trong settings.

### Input / Form

- Height 48, radius-md, bg-muted
- Error: border-danger + helper text
- Label phía trên, không placeholder-only (a11y)

### Toast / Banner

- Success / error / warning
- Safe Ride banner: `danger` + icon shield + CTA lớn

### Countdown (Queue)

- Số **mono**, size lớn
- `> 30s`: primary/muted  
- `≤ 30s`: warning  
- `≤ 10s`: danger + pulse nhẹ

---

## Animation & micro-interaction

| Pattern | Spec |
|---------|------|
| Screen enter | Fade + translateY 8→0, 200–250ms |
| Button press | Scale 0.97, 80ms |
| Modal | Slide up spring (damping ~18) |
| Queue advance | List item layout animation (Reanimated) |
| Accept success | Check burst ngắn + confetti **nhẹ** (optional, 1 lần) |
| Reject | Shake ngang 200ms subtle |
| Skeleton | Shimmer dark, không blink trắng |

**Nguyên tắc cảm giác:**

1. Mọi CTA chính có pressed state trong **100ms**.
2. Không animation > 400ms chặn thao tác.
3. `reduce-motion`: tắt pulse/glow, giữ fade ngắn.
4. 60fps ưu tiên; tránh animate `width`/`height` layout nặng — dùng transform/opacity.

---

## Iconography & illustration

- Lucide / custom set outline 1.5–2px
- Empty states: illustration tối giản (ly bia / ghế trống) — 1 màu accent
- Không meme phản cảm

---

## Dark-first layout patterns

1. **Hero session**: gradient subtle stone → black + primary accent line
2. **Bottom CTA bar**: blur/elevated, safe-area padding
3. **Tab bar**: dark elevated, active = primary amber

---

## Best Practices

- Chỉ dùng semantic tokens (`bg-primary`), không hex rải rác.
- Touch target ≥ 44×44.
- Copy + icon cùng nghĩa với màu (a11y).
- Test trên máy Android tầm trung (shadow/elevation).
- Review UI ban đêm (brightness thấp).

## Anti-patterns cần tránh

- Light theme “trắng tinh” làm default.
- Primary xanh lá / tím không liên quan brand.
- Confetti/haptic spam mỗi tin nhắn chat.
- Font size 11px cho nội dung tiếng Việt dài.
- Card lồng card + shadow chồng chéo.
- Countdown nhảy layout (số không tabular/mono).

---

## Checklist design review

- [ ] Dark nền + contrast text
- [ ] CTA primary amber rõ
- [ ] Level badge đúng 4 cấp
- [ ] Spacing bội số 4
- [ ] Animation tắt được (reduce motion)
- [ ] Safe Ride (nếu có) đủ nổi
