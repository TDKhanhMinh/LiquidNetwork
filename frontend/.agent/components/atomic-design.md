# Components — Atomic Design (LiquidNetwork)

## Các tầng

| Tầng | Định nghĩa | Ví dụ | Nơi đặt |
|------|------------|-------|---------|
| **Atom** | Không domain, tái sử dụng cao | `Button`, `Text`, `Input`, `Spinner` | `shared/ui` |
| **Molecule** | Ghép atoms, vẫn generic | `SearchField`, `AvatarWithBadge` | `shared/ui` |
| **Organism** | Khối UI lớn hơn, có thể hơi domain | `SessionCard`, `QueueEntryRow` | feature `ui/` hoặc shared nếu ≥2 features |
| **Template** | Layout slots | `Screen`, `TabScaffold` | `shared/ui` / `app` layouts |
| **Page/Screen** | Gắn data | `InvitationQueueScreen` | `features/*/screens` + route `app/` |

---

## Quy tắc promote

1. Component dùng 1 feature → để trong feature.
2. Dùng 2+ features hoặc design system → `shared/ui`.
3. Stabilize API props trước khi promote.

---

## Atom contracts

### Button

```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
};
```

### AlcoholLevelBadge (molecule)

```ts
type Props = { level: AlcoholLevel; size?: "sm" | "md"; showLabel?: boolean };
```

---

## Composition over config bloat

```tsx
// ✅ composition
<Card>
  <Card.Header />
  <Card.Body />
</Card>

// ❌ 20 boolean props: showHeader, showFooter, isDrunk, isHost...
```

Xem thêm: boolean prop explosion → tách variant components.

---

## Best Practices

- Props controlled khi cần form; uncontrolled default OK cho UI đơn giản.
- `accessibilityLabel` / role cho control.
- Forward ref khi library cần (input).
- Story hoặc example screen dev cho atoms quan trọng.

## Anti-patterns cần tránh

- Atom import feature API.
- Molecule 800 dòng “AllInOneCard”.
- Style inline phá token.
- Tên mơ hồ: `Box1`, `ItemNew`.
