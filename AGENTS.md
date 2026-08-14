# AGENTS.md — Ticket Booking System (Global)

## Overview

Ticket booking platform built with:
- **Backend**: Spring Boot 4.1 / Java 21 / Maven — package-by-feature
- **Frontend**: (planned) — pages align with each backend version
- **Database**: PostgreSQL 16 managed by Flyway — migrations in `db/migration/`
- **Cache**: Redis 7

Each feature version (V1→V5) is a **vertical slice** covering DB migration + backend module + frontend pages. Rules for each version live in `.agents/v{n}-{name}/AGENTS.md`.

---

## Project Layout

```
Ticket_Booking_System/
├── AGENTS.md                             # ← You are here (global rules)
├── .agents/                              # Per-version rules (vertical slices)
│   ├── v1-identity/AGENTS.md            # auth + user + DB V1 + FE auth pages
│   ├── v2-venue/AGENTS.md               # venue + DB V2 + FE venue pages
│   ├── v3-event/AGENTS.md               # event + show + DB V3-V4 + FE event pages
│   ├── v4-booking/AGENTS.md             # booking + payment + DB V7-V8 + FE booking flow
│   └── v5-ticketing/AGENTS.md           # ticketing + DB V9 + FE ticket pages
│
├── backend/
│   └── src/main/java/com/phuc/ticketbooking/
│       ├── BackendApplication.java
│       ├── common/                        # Shared infrastructure (see below)
│       ├── auth/                          # V1
│       ├── user/                          # V1
│       ├── venue/                         # V2
│       ├── event/                         # V3
│       ├── booking/                       # V4
│       └── payment/                       # V4
│
├── frontend/                              # (planned)
│
├── db/
│   ├── migration/                         # Active Flyway migrations (V1__, V2__, ...)
│   └── example/                           # Reference schemas (17 files, read-only reference)
│
├── infrastructure/
│   ├── app/                               # Docker: PostgreSQL + Redis
│   └── tools/                             # Docker: pgAdmin, Redis Commander
│
├── .env                                   # Spring Boot env vars (gitignored)
├── .env.example                           # Template
└── run-all.ps1                            # Dev startup script
```

---

## Module → Migration Map

| Version | Backend Modules | Migration Files | FE Pages |
|---------|----------------|-----------------|----------|
| V1 | `auth`, `user` | `V1__identity_access.sql` | login, register, profile |
| V2 | `venue` | `V2__venue_management.sql` | venue list, venue detail |
| V3 | `event` | `V3__event_management.sql`, `V4__show_management.sql`, `V5__pricing.sql`, `V6__promotions.sql` | event list, event detail, show seats |
| V4 | `booking`, `payment` | `V7__booking.sql`, `V8__payment.sql` | checkout, payment, booking history |
| V5 | `ticketing` | `V9__ticketing.sql` | my tickets, ticket transfer |

---

## Implementation Status

| Version | DB Migration | Backend | Frontend |
|---------|-------------|---------|----------|
| V1 | ✅ Done | 🔧 common built, auth/user pending | ❌ Not started |
| V2 | ❌ | ❌ | ❌ |
| V3 | ❌ | ❌ | ❌ |
| V4 | ❌ | ❌ | ❌ |
| V5 | ❌ | ❌ | ❌ |

---

## Build & Run

```powershell
# Full dev environment (Docker + Backend + Frontend)
./run-all.ps1

# Skip containers (use existing Docker)
./run-all.ps1 -NoContainers

# Backend only
./run-all.ps1 -NoContainers -NoFrontend

# Run backend directly
cd backend && ./mvnw spring-boot:run

# Tests
cd backend && ./mvnw test
```

**Toolchain**: Java 21, Maven, Spring Boot 4.1.0  
**Profiles**: `local` active by default → `application-local.yml`

### Environment Variables (root `.env` → Spring Boot)

| Variable | Default | Used by |
|----------|---------|---------|
| `SERVER_PORT` | `8080` | Tomcat |
| `POSTGRES_HOST` | — | DataSource |
| `POSTGRES_PORT` | — | DataSource |
| `POSTGRES_DATABASE` | — | DataSource |
| `POSTGRES_USERNAME` | — | DataSource |
| `POSTGRES_PASSWORD` | — | DataSource |
| `REDIS_HOST` | — | Redis |
| `REDIS_PORT` | — | Redis |
| `JACKSON_TIME_ZONE` | `Asia/Ho_Chi_Minh` | Hibernate + Jackson |
| `LOG_LEVEL_ROOT` | `INFO` | Logging |

Docker (`infrastructure/app/`) uses a **separate** `.env` with different variable names.

---

## Global Backend Conventions

### Configuration

- **No Hardcoding**: Never hardcode configuration values (e.g., Cache TTLs, Retry Attempts, Expirations, URLs, Ports, Secret Keys) using `static final` constants or literals in Java files.
- **Centralized Properties**: Always define properties in `application-local.yml` (and map them to `.env` where appropriate). Bind them using Spring's `@ConfigurationProperties` into the central `common/config/AppProperties.java` record.
- **Injection Rule**: NEVER use field-level `@Value` injection. Always inject the `AppProperties` record via constructor injection (`@RequiredArgsConstructor`) into your services.

### Package Structure (per module)

```
module/
├── cache/             # Redis cache services and cache records (NOT DB)
├── controller/        # REST endpoints — delegates ONLY to application service
├── dto/               
│   ├── request/       # Request DTO records
│   └── response/      # Response DTO records
├── entity/            # JPA entities
├── mapper/            # MapStruct mapper interfaces
├── repository/        # Spring Data JPA interfaces
└── service/           
    ├── application/   # Orchestration, use cases (calls domain services, NEVER repos)
    │   └── impl/
    └── domain/        # Core logic, CRUD (calls repositories directly)
        └── impl/
```

> **Empty packages**: Only create a sub-package when it contains at least one file. Do NOT pre-create empty folders "for later". If a module has no JPA entities (e.g., `auth`), omit the `entity/` folder entirely. Same applies to `mapper/`, `repository/`, or any other sub-package. Remove a folder if its last file is deleted.

### Entities

- Extend `BaseEntity` (`common/entity/BaseEntity.java`) — provides UUID id, `@Version`, `createdAt`, `updatedAt`
- Soft delete via `deletedAt` column where applicable
- Lombok: `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`

### DTOs & Mappers

- Java `record`s — **never expose JPA entities directly in API responses**
- Split into `dto/request/` and `dto/response/` packages
- Request DTOs: validated with Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Size`, ...)
- Use **MapStruct** (`mapper/` package) for Entity ↔ DTO conversion. **Rule:** ALWAYS declare MapStruct mappers as `abstract class` instead of `interface` (and use `protected` instead of `default` for custom mapping methods). This prevents a known bug in Eclipse JDT / VS Code language server where it throws an erroneous `java.util.ArrayList` error when compiling MapStruct mappers with Lombok.
- IDs in the URL path are NOT repeated in the request body

### Services

- **Domain Services** (`service/domain/`): Direct repository access, core domain logic. ONLY these can inject Repositories.
- **Application Services** (`service/application/`): Orchestration, cross-module calls. Can ONLY inject Domain Services (or other App Services), NEVER Repositories.
- Always define an interface + implementation pair. Implementations go in `impl/` subdirectories.
- `@Transactional` on write methods, `@Transactional(readOnly = true)` on read methods.
- Use Spring's `@Transactional` — not `jakarta.transaction`.

### Controllers

- Thin — parse request, call service, return response
- API prefix `/api` set globally via `server.servlet.context-path`
- Return `ResponseEntity` only when setting headers or a non-default status code

### Endpoint Naming

All endpoints follow **RESTful resource-oriented** conventions.

**Base path**: `@RequestMapping` on the controller class uses the **plural noun** of the resource (e.g., `/users`, `/venues`, `/events`). Exception: non-resource modules like `auth` use a descriptive name (`/auth`).

**URL structure**:

| Pattern | Example | Meaning |
|---------|---------|--------|
| `/{resources}` | `GET /users` | List / collection |
| `/{resources}/{id}` | `GET /users/{userId}` | Single resource by ID |
| `/{resources}/me` | `GET /users/me` | Current authenticated user's own resource |
| `/{resources}/{id}/{sub}` | `GET /venues/{venueId}/sections` | Nested sub-resource |
| `/{action-verb}` | `POST /auth/login` | Non-CRUD action (only under non-resource controllers) |

**Rules**:
1. Use **kebab-case** for multi-word segments: `/seat-categories`, `/show-times` — never camelCase or snake_case.
2. Use **plural nouns** for resource collections: `/events`, NOT `/event`.
3. Let the **HTTP method** express the action — avoid verbs in paths for CRUD:
   - `POST /users` (create) — not `POST /users/create`
   - `PUT /users/{id}` (full update) — not `POST /users/{id}/update`
   - `DELETE /users/{id}` (delete) — not `POST /users/{id}/delete`
4. **Non-CRUD actions** use a verb as the last segment: `POST /auth/login`, `POST /auth/logout`, `POST /bookings/{id}/cancel`.
5. Path variable names use **camelCase** and include the entity name: `{userId}`, `{venueId}`, `{eventId}` — not `{id}` (except when there is only one path variable and the context is unambiguous).
6. **Query parameters** for filtering, sorting, paging on list endpoints: `GET /events?status=PUBLISHED&page=0&size=20`.
7. No trailing slashes: `/users`, not `/users/`.

### Error Handling

**Only 4 files** in `common/exception/` — do NOT create per-type exception subclasses:

| File | Purpose |
|------|---------|
| `ApiException.java` | Single exception class, carries an `ErrorCode` |
| `ErrorCode.java` | Enum of ALL error codes — add new codes here, never new classes |
| `ErrorResponse.java` | Standard JSON error body |
| `GlobalExceptionHandler.java` | `@RestControllerAdvice` — maps `ApiException` → HTTP response |

**Throwing errors:**
```java
// Always use one of these two forms:
throw new ApiException(ErrorCode.USER_NOT_FOUND);
throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email " + email + " is taken");
```

**Adding a new error type** → add an entry to `ErrorCode` enum. Never create a new exception class.

Standard error response body:
```json
{
  "status": 404,
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "timestamp": "2026-08-01T23:00:00Z",
  "path": "/api/users/me"
}
```

### Security

- JWT-based, stateless — `Authorization: Bearer <token>` header
- `SecurityConfig` defines public endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`)
- All other endpoints require a valid JWT (enforced after V1 auth module is built)

### Authorization

Use **permission-based** authorization — never role-based. The DB has a fine-grained permissions table (`permissions.code`); roles are just containers for grouping permissions.

**Rules:**
1. Always use `@PreAuthorize("hasAuthority('" + CONSTANT + "')")` — never `hasRole()`.
2. Permission constants live in `AppPermissions.java` (`common/constant/`). Add new codes there when introducing new endpoints.
3. Use **regular import** + Java string concatenation for compile-time safety:
   ```java
   import com.phuc.ticketbooking.common.constant.AppPermissions;

   @PreAuthorize("hasAuthority('" + AppPermissions.USER_LIST + "')")
   ```
4. Permission codes must **exactly match** the `code` column in the `permissions` table.
5. `/me` endpoints (user accessing own data) do NOT require permission checks — authentication alone is sufficient.

### Testing

- **Unit tests**: Mockito + AssertJ — `*Test.java`
- **Integration tests**: `@WebMvcTest` slices for controllers, `@DataJpaTest` for repositories — `*IntegrationTest.java`

---

## Global Frontend Conventions

### Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| React | 19 | |
| TypeScript | ~6.0 | strict mode |
| Vite | 8 | bundler, `@` alias → `src/` |
| TailwindCSS | **4** | via `@tailwindcss/vite` plugin — no `tailwind.config.js` |
| React Router | v7 | `useRoutes()` pattern |
| Redux Toolkit | 2 | global state |
| React Hook Form | 7 | + Zod 3 for validation |
| Axios | 1 | HTTP client |
| class-variance-authority | 0.7 | component variants (`cva`) |
| framer-motion | 12 | animations |
| lucide-react + react-icons | latest | icons |
| jwt-decode | 4 | decode JWT claims client-side |

### Project Layout

```
frontend/
├── package.json
├── vite.config.ts          # alias @/ → src/, proxy /api → :8080, port 5173
└── src/
    ├── main.tsx             # Entry: <Provider store> + <BrowserRouter> + <App>
    ├── index.css            # Tailwind 4 base import + global styles
    │
    ├── app/                 # Bootstrap — NO business logic here
    │   ├── App.tsx          # Renders <AppRouter />
    │   ├── router/
    │   │   ├── AppRouter.tsx              # useRoutes([...all feature routes])
    │   │   ├── {Feature}Router.tsx        # 1 file per domain feature
    │   │   └── guards/
    │   │       ├── ProtectedRoute.tsx     # auth check + optional permission check
    │   │       └── PublicRoute.tsx        # redirect to / if authenticated
    │   └── store/
    │       ├── index.ts     # configureStore — register all feature reducers here
    │       └── hook.ts      # useAppDispatch + useAppSelector (typed)
    │
    ├── core/                # Platform infrastructure — NO UI components
    │   ├── api/
    │   │   ├── endpoints.ts             # All API endpoint constants (AUTH_ENDPOINTS, USER_ENDPOINTS, ...)
    │   │   └── client/
    │   │       ├── publicClient.ts      # Unauthenticated Axios instance
    │   │       └── privateClient.ts     # Authenticated — auto-attach Bearer + silent refresh on 401
    │   ├── auth/
    │   │   └── tokenStorage.ts          # In-memory accessToken store (see Token Storage rules)
    │   ├── config/
    │   │   └── constants.ts             # APP_NAME, PAGINATION, ROLES constants
    │   └── types/
    │       ├── api.ts                   # ApiResponse<T>, PaginatedResponse<T>, ApiError
    │       └── ...
    │
    ├── shared/              # Reusable UI — NO feature-specific logic
    │   ├── components/
    │   │   ├── atoms/       # Primitives: Button, Input, Badge, Avatar, Checkbox, Select, ...
    │   │   ├── molecules/   # Compositions: DataTable, Pagination, Modal, FormField, ...
    │   │   ├── organisms/   # (reserved for complex compositions)
    │   │   └── layout/
    │   │       ├── MainLayout.tsx  # Sidebar + Navbar + <Outlet /> — used by all protected routes
    │   │       ├── SideBar.tsx
    │   │       └── Navbar.tsx
    │   ├── hooks/           # useDebounce, ... (generic, no feature coupling)
    │   └── types/
    │       └── user.type.ts # Shared User interface — MUST stay aligned with backend UserResponse
    │
    └── features/            # Feature-sliced — one directory per domain
        ├── auth/            # V1
        ├── users/           # V1
        ├── home/            # V1
        ├── venues/          # V2 — create when implementing V2
        ├── events/          # V3
        ├── bookings/        # V4
        └── ticketing/       # V5
```

### Feature Module Structure

Every feature directory follows the same layout:

```
features/{feature}/
├── components/       # UI components scoped to this feature only
│   ├── {feature}-form/
│   └── {feature}-list/
├── hooks/            # useXxxForm, useXxxList — encapsulate logic
├── pages/            # XxxPage.tsx — one per route, lazy-loadable
├── schemas/          # Zod schemas: xxx.schemas.ts
├── services/         # xxx.service.ts — calls core/api/client, returns typed data
├── store/            # xxx.slice.ts + xxx.thunk.ts + xxx.selectors.ts (if needed)
├── types/            # xxx.types.ts — request/response interfaces
└── index.ts          # Barrel exports (pages only — consumed by router files)
```

> **Empty packages**: Only create a sub-directory when it has at least one file. Do NOT pre-create empty folders.
> **Rule**: **DO NOT define sub-components inside page files.** All UI components, even if used only by a single page, must be extracted to the feature's `components/` directory or `shared/components/`.

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page | `PascalCasePage.tsx` | `LoginPage.tsx` |
| Component | `PascalCase.tsx` | `AuthLayout.tsx` |
| Hook | `useCamelCase.ts` | `useLoginForm.ts` |
| Service | `camelCase.service.ts` | `auth.service.ts` |
| Schema | `camelCase.schemas.ts` | `auth.schemas.ts` |
| Types | `camelCase.types.ts` | `auth.types.ts` |
| Slice | `camelCase.slice.ts` | `auth.slice.ts` |
| Thunk | `camelCase.thunk.ts` | `auth.thunk.ts` |
| Selectors | `camelCase.selectors.ts` | `auth.selectors.ts` |
| Router | `{Feature}Router.tsx` | `UserRouter.tsx` |

### Routing

- Feature routes defined in `app/router/{Feature}Router.tsx` → imported in `AppRouter.tsx`
- Protected pages: wrapped with `<ProtectedRoute permission="PERMISSION_CODE">` — accepts optional permission string; if omitted, only auth is required
- Public pages (login, register): wrapped with `<PublicRoute>` — redirects to `/` if already authenticated
- The `MainLayout` is used for both authenticated and public storefront routes.
- The `HomePage` (`/`) is public and does not require authentication.

### State Management (Redux Toolkit)

- One slice per feature: `{feature}.slice.ts`
- Async side effects via `createAsyncThunk` in `{feature}.thunk.ts`
- Memoized selectors in `{feature}.selectors.ts`
- Reducers registered in `app/store/index.ts` — only place to `configureStore`
- Use `useAppDispatch` / `useAppSelector` (never raw `useDispatch` / `useSelector`)
- Zustand is installed but **not used** — stick to Redux Toolkit for consistency

### Token Storage — In-Memory + HttpOnly Cookie

**Access token**:
- Stored **in memory only** (module-level variable in `core/auth/tokenStorage.ts`)
- Never written to `localStorage` or `sessionStorage`
- Lost on page refresh → `privateClient` silently re-fetches via refresh endpoint on first 401

**Refresh token**:
- Set by server as an **HttpOnly cookie** — not accessible from JavaScript
- Automatically included by the browser in refresh requests (`withCredentials: true`)

**`privateClient` auto-refresh flow**:
1. Read `accessToken` from memory → attach as `Authorization: Bearer <token>`
2. On 401 response → call `POST /auth/refresh` (browser sends cookie automatically)
3. Store new `accessToken` in memory → retry the original request
4. If refresh also fails → dispatch `logout` → redirect to `/login`

### API Layer

- `publicClient` — unauthenticated Axios instance (login, register, OTP, refresh)
- `privateClient` — authenticated instance with auto-refresh interceptor
- All endpoints are constants in `core/api/endpoints.ts` — never hardcode URL strings in services
- Services return typed data directly (no raw `AxiosResponse` exposure)
- Response unwrapping (e.g., extracting `.data` from `ApiResponse<T>`) done inside the client interceptor, not in services

### Forms

- Always use `react-hook-form` + `@hookform/resolvers/zod`
- Zod schemas live in `features/{feature}/schemas/xxx.schemas.ts`
- Validation messages in Vietnamese
- Encapsulate form state + submit logic in a custom hook `useXxxForm.ts` — pages only call `const { form, onSubmit, ... } = useXxxForm()`

### Components

- Atoms use `cva` + `cn` (clsx + tailwind-merge) for variants — no ad-hoc className construction
- Never use inline `style={{}}` — use Tailwind classes exclusively
- All interactive elements must have unique, descriptive `id` attributes for testing

### Design System (UI/UX)

- **Colors**:
  - Primary (Brand): High saturation Indigo (`#4f46e5` - Indigo 600) for Main CTAs, active states, and logo.
  - Secondary/Accent: Vibrant Orange (`#ea580c`) or Rose (`#e11d48`) for high contrast highlights like Badges.
  - Semantic: Emerald (Success), Orange (Warning), Rose (Danger/Error).
  - Neutrals: Alternating sections must use `bg-background` and `bg-surface` (or `bg-surface-1`) to separate content horizontally.
  - **Dark / Light Mode Support**: MUST use semantic CSS variables mapped in Tailwind (`bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `border-border`) rather than hardcoding static colors (e.g. `bg-slate-50`, `text-slate-900`). This ensures the UI scales properly across Dark and Light themes.
  - Badges/Tags floating on images MUST use solid background colors with white text for maximum contrast (not pastel).
  - Use Tailwind CSS v4 variables (`--color-primary-*`) in `index.css`.
- **Typography**:
  - `Inter` or `Poppins` cho văn bản chung và tiêu đề.
  - `JetBrains Mono` hoặc font monospace khác cho mã vé, mã giảm giá.
- **Layout & Interaction**:
  - **Navigation**: Sticky Navbar.
  - **Cards**: Glassmorphism hoặc flat design với `shadow-md` và hover effects (`-translate-y-1`, `shadow-lg`).
  - **Booking Flow**: Step-based (nhiều bước) có progress bar. **Bắt buộc Mobile-first** (touch targets ≥ 44px).
- **Event Storefront (B2C)**:
  - **Hero Section**: Use high-quality real-world event photography (concerts, crowds, theater) for backgrounds rather than abstract graphics. Ensure a clean "above the fold" layout.
  - **Search & Filters**: Always provide quick filter chips (e.g., "Today", "This Weekend", "Near me") below the main search bar to speed up discovery.
  - **Event Cards**: Cards MUST display crucial decision-making data: Date/Time, Venue, and Price Range (e.g., "Từ 500k"). Include Social Proof (e.g., "1.2k interested") and Scarcity Badges ("Selling Fast", "Sold Out"). Include interactive elements like 'Favorite/Heart' and 'Share' buttons directly on the card.
- **Animations**:
  - Dùng `framer-motion` cho transitions mượt mà giữa các bước.
  - Ưu tiên dùng Skeleton loading thay cho spinner đơn điệu.

---

## Infrastructure

### Docker (`infrastructure/app/`)
Services: PostgreSQL 16 Alpine + Redis 7 Alpine, connected via `ticket_booking_network` bridge, data in named volumes.

### Docker Tools (`infrastructure/tools/`)
Dev tools: pgAdmin, Redis Commander.

### `run-all.ps1` Flags
- `-NoContainers` — skip Docker Compose
- `-NoBackend` — skip Spring Boot
- `-NoFrontend` — skip frontend dev server
