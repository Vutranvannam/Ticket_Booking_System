# Frontend — Ticket Booking System

This is the React Single Page Application (SPA) for the Ticket Booking System, heavily prioritizing premium aesthetics, responsiveness, and a strict Feature-Sliced Design (FSD) directory architecture.

## 🛠️ Technologies
- **React 19**
- **TypeScript** (Strict Mode)
- **Vite 8**
- **Tailwind CSS 4** (Via `@tailwindcss/vite`)
- **React Router v7**
- **Redux Toolkit 2**
- **React Hook Form 7** + **Zod 3**
- **Framer Motion 12**

## 🏗️ Architecture: Feature-Sliced Design
Business logic and components are kept isolated per feature.

```text
src/
├── app/               # Bootstrap logic (Router configuration, Global Store setup)
├── core/              # Global application config, API interceptors, constants
├── shared/            # Reusable UI primitives (Atoms, Molecules, Layouts, standard Hooks)
└── features/          # Domain-specific modules (auth, users, events, etc.)
    └── {feature}/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── schemas/
        ├── services/
        ├── store/
        └── types/
```

## 📜 Key Frontend Patterns
1. **Token Security:** Access tokens are stored **in-memory only** (in `core/auth/tokenStorage.ts`), never in LocalStorage. Refresh tokens are handled transparently by the browser via HttpOnly cookies.
2. **API Interceptor:** `privateClient.ts` handles attaching the Access Token and silently refreshing it if a `401 Unauthorized` response is received.
3. **Form Validation:** We use `react-hook-form` connected strictly to `zod` schemas for client-side validation (with Vietnamese error messages).
4. **UI Philosophy:** The UI is designed to feel premium. We utilize dynamic styling, Micro-animations via `framer-motion`, and Glassmorphism effects. Tailwind variables map to semantic themes.

## 📈 Module Status
| Feature Module | Version Slice | Status | Description |
|----------------|---------------|--------|-------------|
| `auth` | V1 | 🟢 **Done** | Login, Register, Password Reset flows. |
| `users` | V1 | 🟢 **Done** | User Profile editing, User listing (Admin). |
| `home` | V1 | 🟢 **Done** | Public landing page and storefront. |
| `venues` | V2 | 🔴 Pending | Venue selection and layout view. |
| `events` | V3 | 🔴 Pending | Browsing events, viewing details. |
| `bookings` | V4 | 🔴 Pending | Multi-step checkout process. |
| `ticketing` | V5 | 🔴 Pending | Ticket inventory and transfer UI. |

## 🚀 Running the Frontend Locally
Make sure you run `npm install` (or `pnpm install` / `yarn install`) before the first run.

```bash
# Start the Vite development server (usually runs on port 5173)
npm run dev
```

*Note: The development server relies on a Vite proxy to redirect `/api` requests to the Backend running on `:8080`.*
