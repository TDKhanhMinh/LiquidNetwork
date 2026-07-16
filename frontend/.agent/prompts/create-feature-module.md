# Prompt: Tạo feature module mới

## Prompt

```
Bạn là senior Frontend Architect LiquidNetwork (Expo + RN).

Đọc:
- .agent/02-architecture.md
- .agent/04-coding-conventions.md
- .agent/05-state-and-data.md
- .agent/06-api-integration.md
- .agent/features/{{feature-name}}.md (nếu chưa có thì draft theo template invitation-queue rút gọn)

### Feature cần scaffold
Tên: **{{feature-name}}** (kebab-case)
Backend module tương ứng: **{{nest-module}}**
Phạm vi MVP:
- {{bullet-capabilities}}

### Cấu trúc bắt buộc
features/{{feature-name}}/
  domain/ data/ model/ ui/ screens/ index.ts

### Yêu cầu
- Public API qua index.ts
- api client dùng shared; query-keys factory
- Types domain tách DTO
- Socket hooks nếu real-time: {{yes/no}}
- Ví dụ 1 screen + 1 mutation + 1 query
- Tests skeleton cho domain pure (nếu có state machine)

### Không được
- Cross-import feature khác sâu
- any
- Hard-code API base URL

Xuất: tree file + code + checklist DoD.
```

---

## Best Practices

- Map rõ Nest module.
- Nhắc invitation-queue nếu đụng mời.

## Anti-patterns cần tránh

- Scaffold cả app router lại từ đầu không cần thiết.
