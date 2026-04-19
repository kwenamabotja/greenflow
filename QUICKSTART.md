# GreenFlow - Local Development Quickstart

✅ **Project is ready to run locally!** 

This document will get you up and running in 5 minutes.

## Prerequisites Installed ✓

- ✓ Node.js v25.6.0 (required: v24+)
- ✓ pnpm v10.33.0 (required package manager)
- ✓ Docker v29.2.0 (for PostgreSQL)
- ✓ All dependencies installed

## Step 1: Start PostgreSQL (2 min)

PostgreSQL is required for the app to work. Choose one:

### Option A: Docker (Recommended - Automatic)

```bash
bash ./setup-db.sh
```

This will:
- Create a PostgreSQL container named `greenflow-db`
- Initialize the database with the schema
- Set up all required tables

### Option B: Manual Docker

```bash
docker run -d \
  --name greenflow-db \
  -e POSTGRES_USER=greenflow \
  -e POSTGRES_PASSWORD=greenflow_pass \
  -e POSTGRES_DB=greenflow \
  -p 5432:5432 \
  postgres:16-alpine

# Wait for DB to start
sleep 3

# Initialize schema
cd lib/db
pnpm run push
```

### Option C: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
createdb greenflow

# Update .env.local:
# DATABASE_URL=postgresql://localhost/greenflow

```

## Step 2: Configure Environment

`.env.local` is already created with defaults! ✓

**For production features (optional):**

If you want Clerk authentication to work:

1. Go to https://dashboard.clerk.com
2. Create a new project
3. Copy your keys
4. Edit `.env.local` and add:
   ```
   CLERK_SECRET_KEY=sk_test_your_key
   CLERK_PUBLISHABLE_KEY=pk_test_your_key
   ```

## Step 3: Start the Application

### Using Interactive Menu (Recommended)

```bash
bash ./start.sh
```

Then choose option 4 or follow the instructions to start both servers.

### Using Make (if available)

```bash
make api        # Terminal 1: API server
make frontend   # Terminal 2: Frontend
```

### Manual (Advanced)

**Terminal 1 - API Server:**
```bash
PORT=8000 pnpm --filter @workspace/api-server run dev
```

**Terminal 2 - Frontend:**
```bash
cd artifacts/greenflow
PORT=5173 pnpm run dev
```

## Step 4: Access the App

Open your browser:

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health

## What's Working

### ✓ Complete Features

- Dashboard with platform metrics
- Route Planner with multi-modal transit options
- Carbon Ledger tracking CO₂ savings
- Green Wallet user management
- Transit Feed (virtual taxis, Gautrain, buses)
- Power-aware routing (Eskom load-shedding integration)
- Transit Hub registry with 15 seeded locations

### ⚠️ Authentication (Optional)

- Works without Clerk (app functions normally)
- With Clerk: Enable sign-up/login features
- Some endpoints require `POST /wallet/users` auth

## Troubleshooting

### Database Connection Error

```
Error: DATABASE_URL, ensure the database is provisioned
```

**Solution:**
```bash
# Check if container is running
docker ps | grep greenflow-db

# If not running, start it
docker start greenflow-db

# Or restart everything
bash ./setup-db.sh
```

### Port Already in Use

```
Error: listen EADDRINUSE
```

**Solution:**
```bash
# Change to a different port
PORT=8001 pnpm --filter @workspace/api-server run dev

# Or kill the process
lsof -ti:8000 | xargs kill -9
```

### "Cannot find module" Errors

```
Error: Cannot find module '@workspace/api-zod'
```

**Solution:**
```bash
pnpm install
pnpm run typecheck:libs
```

### Module Not Found: `esbuild-plugin-pino`

```bash
cd artifacts/api-server
pnpm install
```

## Database Management

### View Database Contents

```bash
docker exec -it greenflow-db psql -U greenflow -d greenflow
```

**Useful queries:**
```sql
SELECT * FROM wallet_users LIMIT 5;
SELECT * FROM transit_hubs;
SELECT * FROM credit_transactions;
```

### Stop Database

```bash
docker stop greenflow-db
```

### Remove Database (⚠️ Deletes all data)

```bash
docker rm greenflow-db
```

## Project Structure

```
├── artifacts/
│   ├── api-server/        # Express API (port 8000)
│   ├── greenflow/         # React frontend (port 5173)
│   └── mockup-sandbox/    # UI mockups
├── lib/
│   ├── db/                # Drizzle ORM schemas
│   ├── api-spec/          # OpenAPI 3.1 spec
│   ├── api-zod/           # Generated Zod validators
│   └── api-client-react/  # Generated React Query hooks
├── SETUP.md               # Full setup guide
├── .env.local             # Environment variables
├── setup-db.sh            # Database setup script
└── start.sh               # Development menu
```

## API Endpoints

**Public:**
- `GET /api/health` - Health check
- `GET /api/transit/feed` - Multi-modal transit options
- `GET /api/power/status` - Eskom load-shedding status
- `GET /api/routes/plan` - Route planning
- `GET /api/carbon/stats` - Carbon statistics
- `GET /api/hubs` - Transit hubs

**Auth Protected** (requires Clerk or mock):
- `POST /api/wallet/users` - Create wallet
- `POST /api/wallet/users/:id/credits/add` - Award credits
- `POST /api/transit/virtual-taxis/ping` - GPS ping

## Common Commands

```bash
# Run everything
bash ./start.sh

# Database setup
bash ./setup-db.sh

# Check types
pnpm run typecheck

# Build all packages
pnpm run build

# View database
docker exec -it greenflow-db psql -U greenflow

# Stop everything
docker stop greenflow-db
```

## Environment Variables Reference

```
NODE_ENV=development              # Set automatically
DATABASE_URL=...                  # PostgreSQL connection
PORT=8000                         # API server port
CLERK_SECRET_KEY=sk_test_...      # Optional
CLERK_PUBLISHABLE_KEY=pk_test_... # Optional
VITE_CLERK_PROXY_URL=...          # Frontend auth
```

## Next Steps

1. **Start database**: `bash ./setup-db.sh` ✓
2. **Start API server**: `PORT=8000 pnpm --filter @workspace/api-server run dev`
3. **Start frontend**: `cd artifacts/greenflow && PORT=5173 pnpm run dev`
4. **Open browser**: http://localhost:5173

## Support

- **Issues**: Check SETUP.md for detailed troubleshooting
- **API Docs**: OpenAPI spec at `lib/api-spec/openapi.yaml`
- **Database**: See schema at `lib/db/src/schema/`

---

**Ready to go!** Run `bash ./start.sh` to begin 🚀
