import type { FaqItem } from "../model/types";

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-queue",
    category: "Queue",
    question: "Invitation Queue hoạt động thế nào?",
    answer:
      "Bạn chọn người theo thứ tự ưu tiên và timeout. Hệ thống mời lần lượt — người đang active có thể Accept/Reject. Hết giờ sẽ chuyển người kế.",
  },
  {
    id: "faq-level",
    category: "Hồ sơ",
    question: "Chỉ số phù hợp dùng để làm gì?",
    answer:
      "Chỉ số phù hợp giúp hệ thống ghép bàn. Bạn có thể tự cập nhật và xem lịch sử thay đổi.",
  },
  {
    id: "faq-safe",
    category: "An toàn",
    question: "Safe Ride là gì?",
    answer:
      "Đồng hành về nhà: ưu tiên an toàn, hỗ trợ gọi xe công nghệ nhanh chóng.",
  },
  {
    id: "faq-review",
    category: "Cộng đồng",
    question: "Peer Review có bắt buộc không?",
    answer:
      "Không bắt buộc, nhưng đánh giá sau khi gặp gỡ giúp cộng đồng tin cậy hơn và cải thiện gợi ý match.",
  },
  {
    id: "faq-premium",
    category: "Thanh toán",
    question: "Plus / VIP mang lại gì?",
    answer:
      "Ưu tiên matchmaking, voucher, đặt bàn ưu tiên, ẩn quảng cáo (tùy gói). Có thể nâng cấp trong mục Premium.",
  },
  {
    id: "faq-report",
    category: "An toàn",
    question: "Tôi muốn báo cáo hành vi xấu?",
    answer:
      "Vào Hỗ trợ → Báo cáo, chọn loại (lạm dụng, spam, an toàn…) và mô tả chi tiết. Đội ngũ sẽ xem xét.",
  },
];
