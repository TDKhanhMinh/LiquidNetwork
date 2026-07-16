# Components — Common Patterns

## 1. Screen shell

```tsx
export function Screen({ title, children, rightAction }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title={title} right={rightAction} />
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  );
}
```

## 2. Async boundary UI

```tsx
if (isLoading) return <QueueSkeleton />;
if (isError) return <ErrorState onRetry={refetch} />;
if (!data?.entries.length) return <QueueEmpty />;
return <QueueList data={data} />;
```

**Luôn** 4 nhánh: loading · error · empty · success.

## 3. Pressable row

- Min height 56 list row.
- Feedback opacity/scale.
- `disabled` style rõ.

## 4. Bottom CTA bar

```tsx
<View className="border-t border-border bg-background-elevated p-4 pb-safe gap-2">
  <Button variant="primary" onPress={onAccept}>Chấp nhận</Button>
  <Button variant="danger" onPress={onReject}>Từ chối</Button>
</View>
```

## 5. Confirmation

- Destructive: “Từ chối lời mời?”, “Kết thúc bàn?”
- Primary destructive = danger; default focus Cancel trên iOS pattern.

## 6. Form field

```tsx
<Controller
  control={control}
  name="selfIntroduction"
  render={({ field, fieldState }) => (
    <TextArea
      value={field.value}
      onChangeText={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

## 7. Optimistic list item

- Dim row khi pending.
- Rollback style nếu fail.

## 8. Socket status banner

```tsx
{!connected && (
  <Banner variant="warning">Mất kết nối — đang thử lại…</Banner>
)}
```

## 9. i18n text

```tsx
<Text>{t("queue.yourTurn")}</Text>
// không hard-code "Your turn"
```

## 10. Haptics

- Success accept: light success haptic.
- Error: warning haptic optional.
- Không haptic mỗi keystroke.

---

## Best Practices

- Tách presentational (`QueueList`) vs connected (`QueueListContainer` / hook trong screen).
- Dùng `cn()` cho class điều kiện.
- Test id ổn định cho E2E sau này.

## Anti-patterns cần tránh

- Spinner full màn khi pull-to-refresh (dùng indicator list).
- Modal không có cách đóng.
- Toast + inline error trùng lặp spam.
- Nested scroll không cần thiết.
