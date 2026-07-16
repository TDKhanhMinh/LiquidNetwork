# 04 — Coding Conventions

## Tổng quan

- **TypeScript strict** — `strict: true`, hạn chế `any`.
- **kebab-case** cho file/folder.
- **Feature-based** — xem `02-architecture.md`.
- ESLint + Prettier (hoặc Biome) — format trước khi PR.
- Ưu tiên **// tiếng Việt** cho comment domain; code identifiers English.

---

## Đặt tên

| Thành phần | Rule | Ví dụ |
|------------|------|--------|
| Folder | kebab-case | `invitation-queue` |
| Component file | kebab-case.tsx | `queue-countdown.tsx` |
| Component symbol | PascalCase | `QueueCountdown` |
| Hook | use + PascalCase | `useQueueCountdown` |
| Function | camelCase | `mapQueueDto` |
| Type / Interface | PascalCase | `InvitationQueueItem` |
| Enum / union | PascalCase + descriptive | `QueueStatus` |
| Constant | SCREAMING_SNAKE hoặc const object | `MAX_QUEUE_VISIBLE` |
| Query key | factory object | `invitationQueueKeys.me()` |
| Test id | kebab / snake ổn định | `accept-invite-button` |

### Đặt tên theo domain VN (UI strings only)

```ts
// ✅ copy i18n
t("queue.accept") // "Chấp nhận"

// ❌
const ChapNhanButton = ...
```

---

## Cấu trúc file component

```tsx
// 1. imports: external → shared → feature relative
// 2. types/props
// 3. component
// 4. subcomponents (nếu nhỏ) hoặc tách file
// 5. styles (NativeWind className; hiếm khi StyleSheet)

import { View, Text } from "react-native";
import { Button } from "@/shared/ui/button";
import { useQueueCountdown } from "../model/use-queue-countdown";

export type QueueCountdownProps = {
  endsAt: string;
  onExpire?: () => void;
};

export function QueueCountdown({ endsAt, onExpire }: QueueCountdownProps) {
  const { label, urgency } = useQueueCountdown(endsAt, onExpire);
  return (
    <View className="items-center">
      <Text className="font-mono text-display text-primary">{label}</Text>
    </View>
  );
}
```

---

## Imports

```ts
// ✅ path alias
import { apiClient } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/auth.store";

// ❌ relative leo ../../../shared
```

Thứ tự: `react` / `react-native` → libs → `@/shared` → `@/features` → relative.

---

## TypeScript

```ts
// ✅
type Props = { id: string; optional?: boolean };

// ❌
function f(x: any) {}

// ✅ unknown + narrow
function handleError(e: unknown) {
  if (e instanceof ApiError) { ... }
}
```

- Prefer `type` cho props/unions; `interface` khi cần extend public API.
- Không dùng `enum` TS numeric trừ khi map backend bắt buộc — ưu tiên union string.
- DTO backend map sang domain type rõ ràng (không leak `_id` lung tung nếu FE dùng `id`).

---

## React / RN

- Function components only.
- Hooks rules nghiêm.
- `useCallback` / `useMemo` khi đo được cost (list lớn, socket handlers) — không “memo hết”.
- List: `FlashList` / `FlatList` + `keyExtractor` ổn định.
- Không define component bên trong component (trừ thật sự local & stable).

---

## Styling (NativeWind)

```tsx
// ✅ tokens
<View className="bg-background-elevated rounded-lg p-4 border border-border" />

// ❌
<View style={{ backgroundColor: "#1C1917", padding: 13 }} />
```

- Dùng `cn()` (tailwind-merge) khi class điều kiện.
- StyleSheet chỉ khi performance/measure cần.

---

## Async & errors

```ts
try {
  await acceptInvite(id);
} catch (e) {
  notifyError(e); // i18n + toast
}
```

- Không `catch (e) {}` nuốt lỗi.
- Mutation: `onError` + optional optimistic rollback.

---

## Git & PR (convention nhẹ)

- Branch: `feat/invitation-queue-countdown`, `fix/chat-reconnect`
- Commit: conventional optional — `feat(queue): add countdown urgency colors`
- 1 PR ~ 1 concern

---

## Testing

- Tên: `describe("QueueCountdown")` / `it("shows danger under 10s")`
- Test behavior, không test implementation chi tiết className trừ khi design-critical.

---

## Best Practices

- Props tối giản; logic vào hook.
- Early return cho loading/error/empty.
- Magic numbers → named constants.
- i18n mọi user-facing string.
- Safe area: `SafeAreaView` / insets cho CTA dưới.

## Anti-patterns cần tránh

- `// @ts-ignore` để qua build.
- `console.log` ship production (dùng logger dev).
- Inline anonymous function nặng trong `renderItem` không memo khi list dài.
- Copy-paste API client.
- Component 500+ dòng không tách.
- Comment “// fix later” cho bug an toàn (Safe Ride).

---

## Snippet checklist trước khi open PR

- [ ] Tên file kebab-case
- [ ] Không `any` mới không justify
- [ ] Có empty / loading / error UI nếu fetch
- [ ] Touch target ≥ 44
- [ ] Strict tsc + lint pass
