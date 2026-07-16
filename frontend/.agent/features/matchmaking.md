# Feature: Matchmaking

## Mục tiêu

Ghép người theo **mode** buổi nhậu. Bốn mode cốt lõi:

| Mode | Tone UI | Note |
|------|---------|------|
| **Networking** | Secondary blue, professional-casual | Bio/nghề nổi |
| **Giải sầu** | Mềm, success/muted | Không hype quá |
| **Debate** | Primary amber, energetic | Rule văn minh |
| **Uống đấm nhau** | Warning accents | **Disclaimer an toàn bắt buộc** |

---

## User flow

```
Chọn mode → (optional filters: level, khu vực, thời gian)
  → Join matchmaking pool (API)
  → Waiting UI (animation nhẹ, cancel được)
  → Matched → preview đối phương / bàn → Accept → vào Session hoặc Queue
  → Timeout pool → empty retry
```

Real-time: `matchmaking.matched`, `matchmaking.timeout` (tên theo BE).

---

## UI states

- **Mode picker:** 4 cards lớn, icon + 1 câu mô tả Việt.
- **Waiting:** cancel CTA, ước lượng “Đang tìm người cùng vibe…”
- **Match found:** profile cards + level badge + Accept/Decline.
- **Uống đấm:** checkbox “Tôi hiểu đây là vui vẻ, không bạo lực thật”.

---

## Data

- `matchmaking.api.ts`: join, cancel, getStatus
- Query/mutation + socket invalidate
- Không fake match client-side

---

## Best Practices

- Disclaimer mode rủi ro trước khi join.
- Cho phép cancel waiting mọi lúc.
- Prefill Drunk Profile khi thiếu intro (soft gate).

## Anti-patterns cần tránh

- Gamify bạo lực / say nguy hiểm.
- Auto-join lại spam khi timeout.
- UI mode giống hệt nhau không phân biệt tone.
