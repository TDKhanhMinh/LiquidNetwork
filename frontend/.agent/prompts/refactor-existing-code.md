# Prompt: Refactor code hiện có

## Prompt

```
Bạn là senior RN engineer LiquidNetwork. Refactor theo Clean-ish + feature-based.

Đọc:
- .agent/02-architecture.md
- .agent/04-coding-conventions.md
- .agent/08-performance-and-optimization.md
- Feature doc liên quan nếu đụng domain

### Phạm vi
Đường dẫn: {{paths}}
Mục tiêu refactor: {{goals — vd: tách screen god component, đưa fetch sang Query, sửa FSD import}}

### Ràng buộc
- Không đổi behavior user-facing (trừ bug rõ)
- Giữ/ improve types strict
- Không thêm lib nặng
- Commit-sized steps nếu diff lớn
- Giữ i18n, dark tokens

### Checklist sau refactor
- [ ] app/ route mỏng
- [ ] domain/data/ui tách
- [ ] query keys
- [ ] không cross-feature deep import
- [ ] list/animation perf OK
- [ ] tsc + tests pass

### Output
1. Plan ngắn
2. Diff/code
3. Rủi ro residual
4. Test plan
```

---

## Best Practices

- Refactor nhỏ, chạy app sau mỗi bước.
- Ưu tiên ranh giới layer trước “đẹp code”.

## Anti-patterns cần tránh

- Rewrite toàn bộ feature không test.
- Đổi public API component im lặng gây break.
