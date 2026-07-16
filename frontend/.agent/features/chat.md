# Feature: Chat Real-time

## Mục tiêu

Chat **1-1** và **theo session** qua Socket.io: tin nhắn mượt, reconnect rõ, UX tối thân thiện VN.

---

## User flows

1. Mở conversation list → mở thread.
2. Gửi text (và phase sau: image).
3. Nhận real-time + notification khi nền.
4. Reconnect khi mất mạng — gửi lại pending (nếu có).
5. Từ session tab Chat → room `session:{id}`.

---

## Domain

```ts
type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: "sending" | "sent" | "failed";
};
```

---

## Real-time

| Event | FE |
|-------|-----|
| `chat.message.created` | Append cache (dedupe by id) |
| `chat.typing` | Show typing row (debounce hide) |
| `chat.message.ack` | sending → sent |

Socket auth: token; join room on mount, leave on unmount.

---

## UI

- Bubble: mine (primary tint) / theirs (elevated).
- Time caption; group by day (“Hôm nay”, “Hôm qua”).
- Composer: input + send; disable empty.
- Failed: icon retry.
- Empty: “Chưa có tin — chào bàn một tiếng đi!”
- List inverted FlashList.

---

## Performance

- Paginate history (cursor).
- Don’t refetch full room mỗi tin.
- Memo `MessageBubble`.

---

## Best Practices

- Optimistic send + rollback fail.
- Dedup event + HTTP history overlap.
- Respect mute / blocked (BE).
- Không log nội dung chat production.

## Anti-patterns cần tránh

- Scroll jump mỗi tin đến.
- Một socket connection per bubble.
- Gửi token trong body message.
- HTML/raw link không sanitize (nếu render rich).
