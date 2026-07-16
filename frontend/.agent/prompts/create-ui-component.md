# Prompt: Tạo UI component (Design System)

## Prompt

```
Bạn là UI engineer LiquidNetwork — design system dark “nhậu đêm”.

Đọc:
- .agent/03-design-system.md
- .agent/components/atomic-design.md
- .agent/components/common-patterns.md
- .agent/04-coding-conventions.md

### Component
Tên: **{{ComponentName}}**
Tầng: Atom | Molecule | Organism
Đặt tại: shared/ui/{{kebab-name}}.tsx  HOẶC  features/{{x}}/ui/

### Spec
- Variants: {{list}}
- Sizes: {{list}}
- States: default, pressed, disabled, loading, error (nếu apply)
- A11y: labels
- Animation: {{none | press scale | ...}} Reanimated nếu cần
- Dùng cho: {{use-case}}

### Yêu cầu
- NativeWind + tokens (primary amber, secondary blue đậm…)
- TypeScript props rõ, không boolean explosion — dùng variant
- Tiếng Việt chỉ trong docs/example, code prop English
- Export sạch; không side-effect API

### Deliverables
1. Component code
2. Usage examples (3)
3. Notes dark mode / contrast
```

---

## Best Practices

- Gắn token level badge nếu liên quan profile.
- Min touch 44.

## Anti-patterns cần tránh

- Pull NativeBase / UI Kitten.
- Hex rải rác.
