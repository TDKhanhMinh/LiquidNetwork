<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture: Feature-Sliced Design (FSD)

This frontend uses [Feature-Sliced Design](https://feature-sliced.design/). Prefer FSD over layering code by Nest-style modules.

## Layers (top → bottom)

| Layer | Path | Role |
|-------|------|------|
| **app** | `src/app/` | Next.js App Router: routes, layouts, providers, global styles |
| **widgets** | `src/widgets/` | Composite UI blocks (header, app-shell, feed sections) |
| **features** | `src/features/` | User scenarios (auth-by-email, logout, …) |
| **entities** | `src/entities/` | Business entities (user, session, drinking-session) |
| **shared** | `src/shared/` | Reusable kit: `ui`, `api`, `lib`, `config`, `hooks`, `types` |

## Import rules

1. A layer may only import from **layers below** it (never above).
2. **Slices on the same layer must not import each other** (e.g. `entities/session` must not import `entities/user`).
3. Import a slice only through its **public API** (`index.ts`), not deep internal paths when possible.
4. `shared` must never import from `entities`, `features`, `widgets`, or app business code.

```
app → widgets → features → entities → shared
```

## Slice segments

Inside a slice, use segments as needed:

- `ui/` — React components
- `model/` — types, hooks, client state
- `api/` — HTTP calls for that slice
- `lib/` — local helpers
- `index.ts` — public exports only

## Examples

```ts
// ✅ feature uses entity + shared
import { sessionApi } from "@/entities/session";
import { Button } from "@/shared/ui";

// ❌ entity importing another entity
import { User } from "@/entities/user"; // inside entities/session — forbidden

// ❌ shared importing a feature
import { useLogin } from "@/features/auth-by-email"; // forbidden
```

## shadcn / UI

- Components live in `src/shared/ui`
- Aliases are configured in `components.json` → `@/shared/ui`, `@/shared/lib/utils`

## Error pages (App Router)

| File | Status | Trigger |
|------|--------|---------|
| `app/not-found.tsx` | 404 | missing route or `notFound()` |
| `app/forbidden.tsx` | 403 | `forbidden()` (needs `authInterrupts`) |
| `app/unauthorized.tsx` | 401 | `unauthorized()` (needs `authInterrupts`) |
| `app/error.tsx` | runtime | uncaught error in segment |
| `app/global-error.tsx` | root | error in root layout |

UI lives in `widgets/error-state` + i18n keys `common:errors.*`.
Helpers: `import { notFound, forbidden, unauthorized } from "@/shared/lib"`.

## HTTP / data layer

- **Axios** instance: `src/shared/api/axiosInstance.ts` (Bearer + 401 refresh queue)
- **apiClient**: `src/shared/api/apiClient.ts` — typed get/post/… (unwraps `{ success, data }`)
- **Tokens**: `localStorage` keys `access_token`, `refresh_token` via `tokenStorage`
- **Env**: `NEXT_PUBLIC_API_BASE_URL` (fallback `NEXT_PUBLIC_API_URL`)
- **TanStack Query**: `src/shared/lib/queryClient.ts` + `QueryClientProvider` in `app/providers.tsx`
- Entity APIs call `apiClient`; features own React Query hooks
- Errors: `normalizeApiError` / `resolveErrorMessage` map `error.code` → i18n `error:*`

```ts
import { apiClient } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";

// entity api
export const fooApi = { list: () => apiClient.get<Foo[]>("/foo") };

// feature hook
useQuery({ queryKey: ["foo"], queryFn: fooApi.list });
```

## i18n (Language-first + lazy namespaces)

- Config & locales: `src/shared/i18n/`
- Files: `src/shared/i18n/locales/{lng}/{ns}.json` (e.g. `vi/auth.json`)
- Languages: `vi` (default), `en`
- Namespaces: `common`, `auth`, `user`, `drinking-session`, `error`
- Hook: `useAppTranslation(["auth", "error"])` from `@/shared/hooks/use-app-translation` — lazy-loads namespaces
- Errors: backend `error.code` → `error:{CODE}` via `resolveErrorMessage` / `notifyError` in `@/shared/lib/error-handler`
- Do **not** put copy strings in entities; use features/widgets + shared i18n
- Prefer deep keys: `t("login.title")` with ns `auth`, or `t("auth:login.title")`

```ts
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { notifyError } from "@/shared/lib/error-handler";

const { t } = useAppTranslation(["auth", "error"]);
// ...
catch (e) { notifyError(e, t); }
```

## Backend mapping

NestJS backend is feature-by-layer under `modules/`. Frontend FSD maps roughly as:

| Backend | Frontend FSD |
|---------|----------------|
| Domain entity / DTO | `entities/*/model` |
| HTTP API | `entities/*/api` or `features/*/api` |
| Use-case / action | `features/*` |
| Shared infra | `shared/*` |
| Controllers / routes | `app/` (pages compose widgets/features) |
