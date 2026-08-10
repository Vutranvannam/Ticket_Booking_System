# V1 — Identity & Access

Covers the **full vertical slice** for authentication and user management:
- **DB**: `db/migration/V1__identity_access.sql`
- **Backend**: `auth/` + `user/` modules
- **Frontend**: login page, register page, profile page

---

## Database — `V1__identity_access.sql`

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Central identity store — email, password_hash, full_name, phone, avatar_url |
| `roles` | Named roles: `CUSTOMER`, `ORGANIZER`, `ADMIN`, `SUPER_ADMIN` |
| `permissions` | Fine-grained permission codes grouped by module |
| `user_roles` | M:N junction: user → roles |
| `role_permissions` | M:N junction: role → permissions |

### Key Design Decisions
- Email uniqueness is a **partial unique index** (`WHERE deleted_at IS NULL`) — allows the same email on soft-deleted rows
- `password_hash` stores BCrypt hash — never plain text
- `version` column on `users` enables optimistic locking (`@Version`)
- Soft delete: `deleted_at` preserves booking/payment history

---

## Backend — `auth/` module

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Register new user, returns JWT tokens |
| `POST` | `/auth/login` | Public | Login with email + password, returns JWT tokens |
| `POST` | `/auth/refresh` | Public (refresh token) | Issue new access token |

### Files

```
auth/
├── controller/
│   └── AuthController.java
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java     # email, password, fullName, phone?
│   │   └── LoginRequest.java        # email, password
│   └── response/
│       └── AuthResponse.java        # accessToken, expiresIn
├── service/
│   └── application/
│       ├── AuthAppService.java         # interface
│       └── impl/
│           └── AuthAppServiceImpl.java
└── security/
    ├── JwtTokenProvider.java        # generate + validate JWT
    ├── JwtAuthenticationFilter.java # OncePerRequestFilter — reads Bearer token
    └── CustomUserDetails.java       # UserDetails wrapping User entity
```

### Rules
- `AuthServiceImpl` must use `PasswordEncoder` (BCrypt) from `SecurityConfig` — never store plain text
- JWT secret and expiry come from application config — never hardcoded
- `AuthController` returns `AuthResponse` on success — never return the `User` entity
- Register flow: check email uniqueness → throw `ApiException(ErrorCode.EMAIL_ALREADY_EXISTS)` if taken
- Login flow: find user by email → verify password → throw `ApiException(ErrorCode.INVALID_CREDENTIALS)` if wrong

---

## Backend — `user/` module

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | Required | Get current user profile |
| `PUT` | `/users/me` | Required | Update current user profile |
| `GET` | `/users` | Admin only | List all users (paginated) |

### Files

```
user/
├── controller/
│   └── UserController.java
├── dto/
│   ├── request/
│   │   └── UpdateProfileRequest.java   # fullName, phone, avatarUrl
│   └── response/
│       └── UserResponse.java           # id, email, fullName, phone, avatarUrl, roles
├── mapper/
│   └── UserMapper.java             # MapStruct interface
├── entity/
│   ├── User.java                   # extends BaseEntity
│   ├── Role.java                   # extends BaseEntity
│   ├── Permission.java             # extends BaseEntity
│   ├── UserRole.java               # @EmbeddedId (userId, roleId)
│   └── RolePermission.java         # @EmbeddedId (roleId, permissionId)
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   └── PermissionRepository.java
└── service/
    ├── application/
    │   ├── UserAppService.java         # interface
    │   └── impl/
    │       └── UserAppServiceImpl.java
    └── domain/
        ├── UserDomainService.java
        ├── RoleDomainService.java
        └── impl/
            ├── UserDomainServiceImpl.java
            └── RoleDomainServiceImpl.java
```

### Rules
- `UserController` reads the authenticated principal from `SecurityContextHolder` — never accept `userId` in request body for `/users/me`
- `UserResponse` must NOT expose `passwordHash` — use `UserMapper` to project safe fields only
- `UserRepository` must have a `findByEmailAndDeletedAtIsNull(String email)` query for login lookup
- Soft delete: set `deletedAt` — do NOT physically delete user rows

---

## Frontend — V1 Pages

*(To be filled when frontend is scaffolded)*

### Pages to build

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + password form → POST `/api/auth/login` |
| `/register` | Register | Full name, email, password → POST `/api/auth/register` |
| `/profile` | Profile | View and edit current user profile |

### Rules
- Store `accessToken` in memory (not localStorage) — store `refreshToken` in httpOnly cookie
- Auto-refresh access token on 401 response using refresh token
- Redirect to `/login` if no valid session

---

## ErrorCode entries required for V1

Add these to `ErrorCode.java` before implementing V1:

```java
// Auth
INVALID_CREDENTIALS(401, "INVALID_CREDENTIALS", "Invalid email or password"),
TOKEN_EXPIRED(401, "TOKEN_EXPIRED", "Token has expired"),
TOKEN_INVALID(401, "TOKEN_INVALID", "Token is invalid"),

// User
EMAIL_ALREADY_EXISTS(409, "EMAIL_ALREADY_EXISTS", "Email already exists"),
USER_NOT_FOUND(404, "USER_NOT_FOUND", "User not found"),
```
