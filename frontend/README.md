# LiquidNetwork Frontend

Next.js frontend for LiquidNetwork, structured with **[Feature-Sliced Design (FSD)](https://feature-sliced.design/)**.

## 🛠 Tech Stack

Dự án sử dụng các công nghệ hiện đại nhất, tối ưu cho hiệu năng và khả năng bảo trì:

### 1. Core Framework & Environment

- **Next.js 16.2** (Sử dụng App Router & Turbopack)
- **React 19**
- **TypeScript 5**
- **Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design/)

### 2. Styling & UI Components

- **Tailwind CSS v4**: Utility-first CSS framework.
- **shadcn/ui** & **Radix UI**: Headless UI components (`src/shared/ui`).
- **@base-ui/react**: Nền tảng UI primitives.
- **lucide-react**: Thư viện icon chuẩn mực.
- **next-themes**: Quản lý Light/Dark mode.
- **tw-animate-css** & **embla-carousel-react**: Hỗ trợ Animation và Carousel.

### 3. State Management & Data Fetching

- **@tanstack/react-query (v5)**: Quản lý server state, cache dữ liệu và xử lý loading/error states.
- **Axios**: HTTP Client được cấu hình sẵn Interceptor để tự động xử lý Bearer Token, Refresh Token và bóc tách API Envelope.

### 4. Internationalization (i18n)

- **i18next** & **react-i18next**: Quản lý đa ngôn ngữ (mặc định: Tiếng Việt `vi`).
- **i18next-resources-to-backend**: Lazy-load các file JSON theo từng namespace (`common`, `auth`, `error`...), tối ưu hóa bundle size kết hợp React Suspense để tránh Hydration Mismatch.

### 5. Utilities & Helpers

- **date-fns**: Xử lý và format thời gian.
- **sonner**: Hiển thị Toast Notifications mượt mà.
- **tailwind-merge** & **clsx**: Xử lý logic gộp dynamic CSS class an toàn.
- **cmdk**: Xây dựng Command Menu (Ctrl+K).
- **input-otp**: UI component chuyên dụng cho mã OTP.

## Project structure

```
src/
├── app/           # Next.js routes, layouts, global styles (FSD app layer)
├── widgets/       # Composite UI (header, app-shell, …)
├── features/      # User scenarios (auth-by-email, logout, …)
├── entities/      # Business entities (user, session, drinking-session)
└── shared/        # UI kit, api, i18n, config, lib, types
    └── i18n/locales/{vi|en}/{namespace}.json
```

**Import rule:** only import downward  
`app → widgets → features → entities → shared`  
Slices on the same layer do not import each other. Use each slice’s `index.ts` as the public API.

See [AGENTS.md](./AGENTS.md) for agent/contributor conventions.

### API contract (backend)

Backend NestJS endpoints are documented in **[docs/API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)** (mirror of `backend/docs/API_ENDPOINTS.md`, v2.0). Use it when wiring `entities/*/api` or features against Auth, Users, Matching, Invitation Queue.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | NestJS API base URL (default `http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | Fallback alias for base URL |

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint
```

## Adding code

| Need | Put it in |
|------|-----------|
| New page / route | `src/app/...` |
| Layout chrome (header, shell) | `src/widgets/...` |
| User action (login, logout) | `src/features/...` |
| Business model + CRUD API | `src/entities/...` |
| Button, utils, http client | `src/shared/...` |

Example feature public API:

```ts
import { LoginForm, useLogin } from "@/features/auth-by-email";
```

## i18n

- Default language: **vi** (fallback `vi`), also `en`
- Locales are **language-first**: `src/shared/i18n/locales/vi/auth.json`
- Namespaces load lazily via `useAppTranslation("auth")` or `useAppTranslation(["auth", "error"])`
- API errors: `error.code` mapped through `src/shared/i18n/locales/*/error.json` + `resolveErrorMessage`

```ts
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

const { t } = useAppTranslation("auth");
t("login.submit");
```
