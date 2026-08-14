# Backend — Ticket Booking System

This is the core RESTful API for the Ticket Booking System, built with a modern Java stack and strictly adhering to Domain-Driven Design (DDD) principles combined with a Package-by-Feature architecture.

## 🛠️ Technologies
- **Java 21**
- **Spring Boot 4.1.0**
- **Maven**
- **Spring Security** (JWT & OAuth2)
- **Spring Data JPA & Hibernate**
- **MapStruct** & **Lombok**
- **Flyway** (Database Migrations)
- **Redis** (Caching & Sessions)

## 🏗️ Architecture: Package-by-Feature
We group classes by the domain feature they belong to, rather than by their technical role.

### Typical Module Structure
```text
module_name/
├── cache/             # Redis caching strategies (SessionCache, UserSecurityCache, etc.)
├── controller/        # REST APIs (Endpoints)
├── dto/               
│   ├── request/       # Request payloads (Validated with @Valid)
│   └── response/      # Response views (Records, hiding internal entities)
├── entity/            # JPA Entities (Extending BaseEntity)
├── mapper/            # MapStruct mappers (Abstract classes)
├── repository/        # Spring Data JPA repositories
└── service/           
    ├── application/   # Orchestration & Cross-module logic (Delegates to Domain Services)
    └── domain/        # Core business logic (Directly manages Repositories)
```

## 📜 Key Coding Standards & Patterns
1. **No `@Value` for Properties:** We use `@ConfigurationProperties` paired with Java `record`s (e.g., `AppProperties`) for immutable, type-safe configuration injection.
2. **Abstract Class Mappers:** All MapStruct mappers are defined as `abstract class` (instead of `interface`) and use `protected` methods to prevent Eclipse/VS Code compiler bugs related to `java.util.ArrayList`.
3. **Service Layering:** `Application Service` orchestrates. `Domain Service` executes DB interactions. Controllers only call Application Services.
4. **Global Exception Handling:** Exceptions are thrown via `throw new ApiException(ErrorCode.XXX)` and handled centrally. No custom exception classes are created.
5. **Secure Deserialization:** The Redis `BasicPolymorphicTypeValidator` is strictly whitelisted to prevent Jackson RCE vulnerabilities.

## 📈 Module Status
| Module | Version Slice | Status | Description |
|--------|---------------|--------|-------------|
| `common` | Core | 🟢 **Done** | Shared config, filters, exception handlers, email service. |
| `auth` | V1 | 🟢 **Done** | Login, Registration, JWT, Session Cache, Password Reset. |
| `user` | V1 | 🟢 **Done** | Profile management, RBAC entities. |
| `venue` | V2 | 🔴 Pending | Venue and seating plan management. |
| `event` | V3 | 🔴 Pending | Event creation, schedules. |
| `booking` | V4 | 🔴 Pending | Ticket reservation and checkout. |
| `payment` | V4 | 🔴 Pending | Payment gateway integration. |
| `ticketing`| V5 | 🔴 Pending | Ticket QR generation and transfer. |

## 🚀 Running the Backend Locally
Ensure you have copied `.env.example` to `.env` in the root folder, and that Docker containers (Postgres, Redis) are running.

```bash
# Compile and run via Maven
./mvnw clean spring-boot:run

# Run Unit Tests
./mvnw test
```
