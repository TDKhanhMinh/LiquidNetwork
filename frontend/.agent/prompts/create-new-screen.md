# Prompt: Tạo screen mới

Sao chép khối dưới vào agent chat và điền `{{...}}`.

---

## Prompt

```
Bạn là senior React Native (Expo) engineer dự án LiquidNetwork (Cồn Thủ).

Đọc và tuân thủ:
- .agent/00-README.md
- .agent/02-architecture.md
- .agent/03-design-system.md
- .agent/04-coding-conventions.md
- .agent/07-navigation-and-routing.md
- .agent/features/{{feature-name}}.md (nếu có)

### Nhiệm vụ
Tạo screen: **{{ScreenName}}**
- Route Expo Router: `{{route-path}}` (vd: app/session/[id]/queue.tsx)
- Feature: `{{feature-folder}}`
- Mục tiêu UX (tiếng Việt): {{mô-tả-1-2-câu}}

### Yêu cầu kỹ thuật
- TypeScript strict, kebab-case files
- Screen mỏng ở app/; logic + UI chính trong features/
- TanStack Query / Zustand đúng vai trò (.agent/05-state-and-data.md)
- NativeWind + design tokens dark-first
- States: loading, error, empty, success
- i18n keys tiếng Việt (không hard-code user string)
- Safe area + touch target ≥ 44
- Không dùng NativeBase

### Deliverables
1. Route file
2. Screen component + hooks cần thiết
3. i18n keys VI (và EN nếu project có)
4. Ghi chú deep link / params
5. Cách test thủ công ngắn

Bắt đầu bằng tóm tắt plan 5–8 gạch đầu dòng, rồi implement.
```

---

## Best Practices

- Nêu rõ feature doc liên quan.
- Chỉ định params route.

## Anti-patterns cần tránh

- Bảo agent “tự chọn stack” khác Expo/NativeWind.
