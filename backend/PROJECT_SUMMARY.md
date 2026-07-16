# Tóm Tắt Dự Án LiquidNetwork

## 1. Tổng Quan Dự Án

**LiquidNetwork** (tên nội bộ: cồn thủ Super App) là một ứng dụng di động kết nối cộng đồng giao lưu tại Việt Nam.
Ứng dụng được thiết kế nhằm giải quyết các vấn đề cốt lõi trong văn hóa giao lưu:

- Giảm áp lực "sợ quê" khi mời người khác.
- Tự động hóa quá trình mời tham gia thông qua hệ thống **Sequential Invite Queue** thông minh.
- Cung cấp "Hồ sơ Giao lưu" để đánh giá mức độ tin cậy và tửu lượng của đối tác.
- Đảm bảo an toàn thông qua tính năng "Đã uống không lái" và liên kết dịch vụ đặt xe.
- Phát triển hệ sinh thái: đặt bàn, quảng cáo, và các chế độ gặp mặt chuyên biệt (Networking, Giải sầu...).

## 2. Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB + Mongoose
- **Background Jobs & Queue:** BullMQ (Redis)
- **Real-time:** Socket.io
- **Validation:** class-validator + class-transformer
- **Authentication:** JWT + Refresh Token
- **Tài liệu API:** Swagger (OpenAPI)
- **Testing:** Jest + Supertest

## 3. Kiến Trúc Hệ Thống (Clean Architecture)

Dự án áp dụng chặt chẽ **Clean Architecture** để tách biệt Business Logic khỏi Framework và cơ sở dữ liệu.
Mỗi module được chia làm 4 layer tuân thủ Dependency Rule:

1. **Domain Layer:** Chứa Business logic cốt lõi (Entities, Value Objects, Domain Exceptions, Repository Interfaces).
2. **Application Layer:** Chứa Use Cases và Application DTOs (Orchestration). Không chứa dependency framework/DB.
3. **Infrastructure Layer:** Triển khai các Database Repositories (Mongoose), External Services, Scheduled Jobs.
4. **Presentation Layer:** Giao tiếp HTTP (Controllers, Request/Response DTOs, Guards, Interceptors).

## 4. Cấu Trúc Thư Mục Hiện Tại

Dự án được tổ chức theo **Feature Module**:

```text
src/
├── modules/                  # Chứa các feature modules độc lập
│   ├── auth/                 # Xác thực & Phân quyền (Login, Refresh, JWT)
│   ├── chat/                 # Tính năng nhắn tin
│   ├── drinking-sessions/    # Quản lý các buổi tiệc
│   ├── invitation-queue/     # Hệ thống gửi lời mời tuần tự (có timeout)
│   ├── matchmaking/          # Tìm người uống cùng mức tửu lượng
│   ├── notifications/        # Thông báo Push/In-app
│   ├── safe-ride/            # Đặt xe "Đã uống không lái"
│   └── users/                # Quản lý User, Drunk Profile, Peer Reviews
│
├── shared/                   # Các thành phần dùng chung toàn dự án
│   ├── common/               # Interfaces, Utilities chung
│   ├── config/               # Quản lý biến môi trường an toàn
│   ├── database/             # Base Repository
│   ├── events/               # Event Bus xử lý giao tiếp nội bộ
│   ├── logger/               # Hệ thống Logging
│   ├── queue/                # Setup BullMQ chung
│   ├── rate-limiter/         # Giới hạn Request chống spam
│   └── types/                # Types/Enums toàn cục
└── main.ts                   # Entry point
```

## 5. Các Tiêu Chuẩn Kỹ Thuật Chính

- **API Design & Response:**
  - Mọi API luôn trả về một format đồng nhất với `success` (boolean), `data`, `meta` (cho phân trang), và `error` (nếu lỗi).
  - Hỗ trợ cả 2 chiến lược phân trang: Offset và Cursor Pagination.
  - Tuân thủ nguyên tắc thiết kế RESTful API (Resource URLs dạng kebab-case, đúng HTTP Methods).
- **Error Handling:**
  - Bắt lỗi qua Global Exception Filter.
  - Sử dụng Custom Domain Exceptions. Không để lọt stack trace ra ngoài ở môi trường Production.
  - Mã lỗi trả về dạng string `UPPER_SNAKE_CASE` (VD: `INVITATION_TIMEOUT`, `VALIDATION_ERROR`).
- **Bảo mật:**
  - Xác thực qua JWT (access/refresh).
  - Rate Limiting ở các route nhạy cảm.
  - Validation dữ liệu vào bằng `class-validator`.
- **Naming Conventions:**
  - **Tên file / thư mục:** `kebab-case` (vd: `advance-queue.use-case.ts`).
  - **Class / Interface:** `PascalCase` (Interface bắt đầu bằng chữ `I`).
  - **Biến / Hàm:** `camelCase`.
  - **Hằng số:** `UPPER_SNAKE_CASE`.

## 6. Tổng Kết

Hệ thống Backend của LiquidNetwork đang được xây dựng rất bài bản với nền móng vững chắc từ NestJS và Clean Architecture. Thiết kế này đặc biệt đề cao tính dễ bảo trì, tính mở rộng (sẵn sàng chuyển hướng Microservices), và tính độc lập của các nghiệp vụ phức tạp (như Sequential Invite Queue).
