# Gauteng GreenFlow — MaaS Platform

## Overview

A Smart Mobility-as-a-Service (MaaS) platform for Gauteng, South Africa, built for the NCIC 2026 Challenge. Combines Gautrain GTFS data, virtual taxi tracking, Eskom load-reduction routing, and a CO₂ carbon ledger with POPIA-compliant Green Wallet.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/greenflow)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (email + Google OAuth)
- **Security**: Helmet, express-rate-limit

## Production-Readiness Features

### Security
- Helmet.js: CSP, HSTS, X-Frame-Options, and other HTTP security headers
- Rate limiting: 200 req/15min general limit; 30 req/15min on write endpoints
- Auth protection (`requireAuth`): POST /wallet/users, POST /wallet/users/:id/credits/add, POST /transit/virtual-taxis/ping, POST /routes/plan
- Request body size capped at 50kb
- Sensitive headers (Authorization, Cookie) redacted from all logs

### Error Handling
- Global error handler middleware (returns JSON, hides stack traces in production)
- 404 handler for unknown API routes
- Try/catch on every async route handler — errors forwarded to global handler
- Process-level `uncaughtException` and `unhandledRejection` handlers with fatal logging
- Graceful shutdown: SIGTERM/SIGINT close HTTP server cleanly with 10s timeout
- React Error Boundary: catches component-level errors and shows a user-friendly screen

### API Reliability
- QueryClient configured: 30s staleTime, 2 retries (none for 401/403/404), no mutation retries
- Clerk session cookie auth flows automatically on all browser requests
- Structured JSON logging (pino) at all severity levels; production mode disables pretty-print

## Architecture

### Frontend (artifacts/greenflow)
- React + Vite SPA at preview path `/`
- Pages: Dashboard, Route Planner, Transit Feed, Carbon Ledger, Green Wallet, Transit Hubs
- API hooks from `@workspace/api-client-react` (generated from OpenAPI spec)

### API Server (artifacts/api-server)
Core routes:
- `/api/transit/*` — Multi-modal transit feed: virtual taxis, Gautrain GTFS, GPS pings
- `/api/power/*` — Eskom/City Power mock load reduction API
- `/api/routes/plan` — Power-aware multi-modal route planner
- `/api/carbon/*` — CO₂ savings ledger (formula: Saved = dist × 120g - dist × 35g)
- `/api/wallet/*` — POPIA-compliant Green Wallet identity & credits
- `/api/hubs/*` — PostGIS-backed transit hub registry
- `/api/dashboard/summary` — Platform dashboard metrics

### Database (lib/db/src/schema)
Tables:
- `transit_hubs` — Johannesburg transit hubs with geospatial lat/lng (15 seeded: Gautrain stations, Metrobus, Taxi Ranks)
- `wallet_users` — POPIA-compliant Green Wallet users (8 seeded)
- `credit_transactions` — Green Credits award history

### Libraries (lib/)
- `lib/api-spec` — OpenAPI 3.1 spec (source of truth)
- `lib/api-client-react` — Generated React Query hooks (Orval)
- `lib/api-zod` — Generated Zod schemas for server validation
- `lib/db` — Drizzle ORM client + schema

### Virtual Taxi Service (lib/virtualTaxiService.ts)
If 3+ users GPS ping the same route within 5 minutes, a Virtual Taxi cluster is broadcast. Uses in-memory clustering with Redis-ready architecture.

### Power-Aware Routing (lib/powerService.ts)
Pulls from mock Eskom API. Applies friction penalties (0.0–1.0) to routes in load-shedding areas. Dead traffic lights add routing penalty.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## NCIC 2026 Judging Criteria Coverage

| Criterion | Implementation |
|-----------|----------------|
| Digital-Only | Virtual Beacons via GPS clustering (no hardware) |
| Gauteng-Specific | Integrates informal taxis + load reduction |
| Environmental | Java-formula CO₂ Carbon Ledger in Node.js |
| Post-Proof-of-Concept | Live deployable URL via Replit |
