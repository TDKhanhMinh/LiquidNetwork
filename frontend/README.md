# LiquidNetwork Frontend

Next.js frontend for LiquidNetwork, structured with **[Feature-Sliced Design (FSD)](https://feature-sliced.design/)**.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (`src/shared/ui`)
- i18next + react-i18next (language-first locales, lazy namespaces)
- Axios + TanStack Query (auto Bearer auth, refresh token, React Query cache)

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
