# 08 — Performance & Optimization

## Mục tiêu

- **60fps** animation chính (queue, chat scroll, tab).
- **Time-to-interactive** màn cốt lõi < cảm giác 1–2s trên máy tầm trung VN.
- Pin & data: socket + image hợp lý.
- Không jank khi countdown + list cùng lúc.

---

## List & images

| Kỹ thuật | Ghi chú |
|----------|---------|
| FlashList / optimized FlatList | Chat, queue history, sessions |
| `keyExtractor` ổn định | Tránh index-only |
| `getItemType` | Heterogeneous rows |
| Image: Expo Image | cache, blurhash placeholder |
| Avatar size đúng | Không load 1024 cho icon 40 |

---

## Re-render control

- Zustand selectors hẹp.
- React Query: structural sharing mặc định — đừng clone object vô ích.
- `memo` cho row component list.
- Tránh context value object mới mỗi render (tách providers).

```tsx
// ✅
const userId = useAuthStore((s) => s.userId);
// ❌
const auth = useAuthStore();
```

---

## Animation

- Dùng **Reanimated** worklets (UI thread).
- Animate `transform` / `opacity`, tránh layout thrash.
- Countdown: cập nhật text 4–10 lần/s đủ; không 60 setState/s.
- `reduce-motion` support.

---

## Network

- `staleTime` hợp lý — đừng refetch spam.
- Parallel queries có `Suspense`/loading skeleton gộp.
- Pagination thay vì load 500 items.
- Socket: patch cache, không full refetch mỗi event.
- Image/API CDN nếu có.

---

## Startup

- Splash cho tới font + auth hydrate.
- Lazy screen nặng (`React.lazy` / deferred import) khi bundle lớn.
- Tránh import cả feature tree ở root layout.

---

## Memory

- Unsubscribe socket on unmount.
- Clear timers countdown.
- `queryClient` gcTime không phình vô hạn cho list realtime.
- Logout: clear cache + secure tokens.

---

## Monitoring

- JS fps / reanimated in dev.
- Sentry/Crashlytics (phase).
- Measure: session open, queue accept latency.

---

## Best Practices

- Profile trước khi “optimize cảm tính”.
- Skeleton thay spinner full-screen khi có layout.
- Batch `setQueryData` khi nhiều events.
- Test trên Android mid-range thật.

## Anti-patterns cần tránh

- Anonymous component trong `renderItem`.
- `JSON.parse(JSON.stringify)` cache.
- Polling 1s + socket trùng lặp.
- Console.log trong render production.
- Ảnh full-res trong list ngang.
- Nested ScrollView list lớn không ảo hóa.

---

## Checklist performance PR

- [ ] List ảo hóa
- [ ] Không re-render storm (React DevTools)
- [ ] Animation UI thread
- [ ] Socket cleanup
- [ ] Image sized
- [ ] Query keys không tạo mới vô tội vạ mỗi render
