# Ticket Booking System

A comprehensive, scalable online ticket booking platform built with a modern technology stack. The system is architected as a set of vertical slices (features) encompassing Database Migrations, Backend Services, and Frontend Applications.

## 🚀 Technology Stack

- **Backend:** Java 21, Spring Boot 4.1.0, Maven, Spring Security (JWT, OAuth2)
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Redux Toolkit, React Hook Form
- **Database:** PostgreSQL 16 (Managed via Flyway Migrations)
- **Cache:** Redis 7
- **Infrastructure:** Docker & Docker Compose

## 📈 Project Status (Vertical Slices)

The project is developed incrementally. Each version (V1–V5) is a vertical slice covering DB, Backend, and Frontend.

| Version | Feature | Status | Backend Modules |
|---------|---------|--------|-----------------|
| **V1** | Identity & Access | 🟢 **Completed** | `auth`, `user` |
| **V2** | Venue Management | 🔴 Pending | `venue` |
| **V3** | Event & Show Management | 🔴 Pending | `event` |
| **V4** | Booking & Payment | 🔴 Pending | `booking`, `payment` |
| **V5** | Ticketing & Transfer | 🔴 Pending | `ticketing` |

> *Note for Agents: Always refer to `AGENTS.md` and `.agents/v{n}-{name}/AGENTS.md` for specific architectural rules before implementing a new version.*

## 📁 Repository Structure

```text
Ticket_Booking_System/
├── AGENTS.md               # Global AI Agent Rules & Architecture Decisions
├── backend/                # Spring Boot REST API
├── frontend/               # React SPA
├── db/migration/           # Flyway SQL migrations
└── infrastructure/         # Docker Compose configurations (Postgres, Redis)
```

## 🛠️ Quick Start

The project includes a PowerShell script to spin up the entire environment effortlessly.

```powershell
# Boot up the full stack (Docker containers, Backend, and Frontend)
./run-all.ps1

# To start without tearing down existing Docker containers
./run-all.ps1 -NoContainers

# To start only the Backend (skip Frontend dev server)
./run-all.ps1 -NoContainers -NoFrontend
```

### Environment Variables
1. Copy `.env.example` to `.env` in the root directory.
2. The root `.env` is loaded automatically by Spring Boot.
3. The Docker services inside `infrastructure/app/` use their own localized `.env` file.

---
*For more detailed information, see [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).*
