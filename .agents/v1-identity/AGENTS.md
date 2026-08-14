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

### Routes

| Path | Page | Guard | Permission |
|------|------|-------|------------|
| `/login` | `LoginPage` | `PublicRoute` | — |
| `/register` | `RegisterPage` | `PublicRoute` | — |
| `/forgot-password` | `ForgotPasswordPage` | `PublicRoute` | — |
| `/reset-password` | `ResetPasswordPage` | `PublicRoute` | — |
| `/dashboard` | `DashboardPage` | `ProtectedRoute` | auth only |
| `/profile` | `ProfilePage` | `ProtectedRoute` | auth only |
| `/users` | `UserListPage` | `ProtectedRoute` | `USER_LIST` |
| `/users/:id` | `UserFormPage` | `ProtectedRoute` | `USER_VIEW` |

### Files to create / update

#### `shared/types/user.type.ts` — rewrite to match backend `UserResponse`

```ts
// Aligned with backend UserResponse record
export interface User {
  id: string;                  // UUID
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
}
```

#### `core/api/endpoints.ts` — V1 endpoint constants

```ts
export const AUTH_ENDPOINTS = {
  LOGIN:    '/auth/login',
  REGISTER: '/auth/register',
  REFRESH:  '/auth/refresh',
  LOGOUT:   '/auth/logout',
} as const;

export const USER_ENDPOINTS = {
  ME:     '/users/me',
  LIST:   '/users',
  BY_ID:  (id: string) => `/users/${id}`,
} as const;
```

#### `core/auth/tokenStorage.ts` — in-memory only (rewrite from localStorage)

```ts
// accessToken stored in memory — never persisted to localStorage
let _accessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => _accessToken,
  setAccessToken: (token: string): void => { _accessToken = token; },
  clearAccessToken: (): void => { _accessToken = null; },
  // refreshToken is managed server-side via HttpOnly cookie — no JS access
};
```

#### `features/auth/types/auth.types.ts` — login uses `email`

```ts
export interface LoginRequest {
  email: string;      // NOT username — backend authenticates by email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
```

#### `features/auth/schemas/auth.schemas.ts` — login schema uses `email`

```ts
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim(),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').trim(),
  password: passwordSchema,   // min 8, upper + lower + digit + special
  phone: z.string().optional(),
});
```

#### `app/router/AuthRoutes.tsx`

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/oauth2/success`
All wrapped with `<PublicRoute>` (except OAuth2 callback).

#### `app/router/UserRouter.tsx`

Routes nested under `<MainLayout>`:
- `/dashboard` — no permission
- `/profile` — no permission (auth only)
- `/users` — `permission="USER_LIST"`
- `/users/:id` — `permission="USER_VIEW"`

### V1 Frontend Rules

1. **Login field**: use `email` — never `username`. Both `LoginRequest` and `loginSchema` use `email`.
2. **Token storage**: `accessToken` in memory only — never `localStorage`/`sessionStorage`.
3. **Refresh**: `privateClient` intercepts 401 → calls `/auth/refresh` with `withCredentials: true` → stores new token → retries original request.
4. **`User.id`**: UUID string, not number — never pass as `Number()`.
5. **`ProtectedRoute`**: accepts optional `permission` prop — compares against `user.permissions[]` from Redux store.
6. **`/me` endpoints**: no `permission` prop needed on `ProtectedRoute` — authentication alone is sufficient.
7. **Sidebar nav items**: show/hide based on `user.permissions` — never hard-code role names for UI guards.

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
