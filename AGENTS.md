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
- Use **MapStruct** (`mapper/` package) for Entity ↔ DTO conversion
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

*(To be filled in when frontend is scaffolded in V1)*

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
