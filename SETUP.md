# Local Development Setup

This guide will help you get the GreenFlow project running locally.

## Prerequisites

- Node.js 24+ (v25.6.0 is installed ✓)
- pnpm (v10.33.0 is installed ✓)
- PostgreSQL 14+ (required for database)

## Step 1: Install Dependencies

Dependencies are already installed! Run this if needed:

```bash
pnpm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Using Docker (Recommended)

```bash
# Start a PostgreSQL container
docker run -d \
  --name greenflow-db \
  -e POSTGRES_USER=greenflow \
  -e POSTGRES_PASSWORD=greenflow_pass \
  -e POSTGRES_DB=greenflow \
  -p 5432:5432 \
  postgres:16-alpine
```

### Option B: Using Local PostgreSQL

```bash
# Create a new database
createdb greenflow

# Note your connection credentials for the next step
```

## Step 3: Configure Environment Variables

### API Server Environment

Create or update `.env.local` in the root directory:

```bash
# For development
NODE_ENV=development

# Database connection (adjust based on your setup above)
# Docker example:
DATABASE_URL="postgresql://greenflow:greenflow_pass@localhost:5432/greenflow"
# Local PostgreSQL example:
DATABASE_URL="postgresql://localhost/greenflow"

# Clerk Authentication (get these from https://dashboard.clerk.com)
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Server port
PORT=8000

# Optional: Log level
LOG_LEVEL=info
```

### Frontend Environment

The frontend will automatically use API server variables when available. For local development:
- The frontend runs on PORT (default 5173 in Vite)
- It connects to the API server at `http://localhost:8000`

## Step 4: Set Up Clerk Authentication (Optional for local testing)

For full functionality, you need Clerk credentials:

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new project
3. Copy your **Secret Key** and **Publishable Key**
4. Add them to `.env.local`

For local testing without Clerk, the app will run but authentication-protected features won't work.

## Step 5: Initialize Database

Push the database schema:

```bash
cd lib/db
pnpm run push
```

This will create all required tables:
- `transit_hubs` - Transit stop locations
- `wallet_users` - Green Wallet users
- `credit_transactions` - Credit transaction history

## Step 6: Run the Project

### Terminal 1 - API Server

```bash
PORT=8000 pnpm --filter @workspace/api-server run dev
```

The server will:
- Build the TypeScript code
- Start on `http://localhost:8000`
- Output logs to the terminal

### Terminal 2 - Frontend

```bash
# From project root, or:
cd artifacts/greenflow
PORT=5173 pnpm run dev
```

The frontend will:
- Start on `http://localhost:5173`
- Connect to API at `http://localhost:8000`
- Hot-reload on file changes

## Troubleshooting

### Database Connection Issues

```
Error: DATABASE_URL, ensure the database is provisioned
```

**Solution**: 
- Verify PostgreSQL is running
- Check DATABASE_URL is set correctly
- Test with: `psql $DATABASE_URL`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution**:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
PORT=8001 pnpm --filter @workspace/api-server run dev
```

### Clerk Authentication Not Working

The app will run without Clerk, but:
- Sign-up/login buttons won't work
- Protected API endpoints will return 401

**Solution**: Get Clerk credentials and update `.env.local`

### Module Not Found Errors

```bash
# Clear cache and reinstall
pnpm install
pnpm run typecheck
```

## Available Commands

```bash
# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API client and Zod schemas (if you modify OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen

# Check database schema (from lib/db)
drizzle-kit studio --config ./lib/db/drizzle.config.ts
```

## Project Structure

- **artifacts/api-server** - Express API server (REST endpoints)
- **artifacts/greenflow** - React Vite frontend
- **lib/api-spec** - OpenAPI specification (source of truth)
- **lib/api-client-react** - Generated React Query hooks
- **lib/db** - Drizzle ORM database schema
- **lib/api-zod** - Generated Zod validation schemas

## API Routes

The API server provides:

- `GET /api/transit/*` - Transit feed (taxis, trains, buses)
- `GET /api/power/*` - Eskom/load-shedding info
- `POST /api/routes/plan` - Route planning
- `GET /api/carbon/*` - CO₂ carbon ledger
- `POST /api/wallet/*` - Green wallet operations
- `GET /api/hubs/*` - Transit hubs registry
- `POST /api/dashboard/summary` - Dashboard metrics

## Next Steps

1. Start PostgreSQL (Option A or B)
2. Set up `.env.local` with your credentials
3. Run `pnpm --filter @workspace/db run push` to create tables
4. Start the API server and frontend as described above
5. Visit `http://localhost:5173` in your browser

Happy coding! 🚀
