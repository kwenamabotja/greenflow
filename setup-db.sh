#!/bin/bash

# GreenFlow Database Setup Script
# This script starts a PostgreSQL database in Docker and initializes the schema

set -e

if [ -f "$(dirname "$0")/.env.local" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$(dirname "$0")/.env.local"
  set +a
fi

echo "🚀 Starting GreenFlow Database Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

# Check if PostgreSQL container is already running
if docker ps -a | grep -q greenflow-db; then
    echo "⚠️  PostgreSQL container 'greenflow-db' already exists"
    if docker ps | grep -q greenflow-db; then
        echo "✓ Container is running"
    else
        echo "Starting existing container..."
        docker start greenflow-db
        sleep 2
    fi
else
    echo "📦 Creating PostgreSQL container..."
    docker run -d \
      --name greenflow-db \
      -e POSTGRES_USER=greenflow \
      -e POSTGRES_PASSWORD=greenflow_pass \
      -e POSTGRES_DB=greenflow \
      -p 5432:5432 \
      postgres:16-alpine
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 3
fi

# Verify database connection
echo "🔍 Testing database connection..."
max_attempts=10
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec greenflow-db pg_isready -U greenflow -d greenflow > /dev/null 2>&1; then
        echo "✓ Database is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_attempts ]; then
        echo "  Waiting... (attempt $attempt/$max_attempts)"
        sleep 1
    fi
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database failed to start after $max_attempts attempts"
    exit 1
fi

# Push database schema
echo "📋 Pushing database schema..."
cd "$(dirname "$0")/lib/db"
pnpm run push

seed_database() {
  echo "🌱 Seeding sample data for local development..."

  local hubCount
  hubCount=$(docker exec greenflow-db psql -U greenflow -d greenflow -tAc "SELECT COUNT(*) FROM transit_hubs;")
  if [ "$hubCount" -lt 8 ]; then
    echo "  - Inserting sample transit hubs..."
    docker exec -i greenflow-db psql -U greenflow -d greenflow <<'SQL'
INSERT INTO transit_hubs (name, type, latitude, longitude, address, suburb, active_virtual_taxis, current_power_status, next_gautrain_departure) VALUES
('Sandton Gautrain Station', 'gautrain', -26.1070, 28.0563, 'Sandton Station Road', 'Sandton', 3, 'normal', '2026-04-18T15:50:00Z'),
('Park Station', 'gautrain', -26.1967, 28.0495, 'Park Station', 'Johannesburg', 2, 'affected', '2026-04-18T15:40:00Z'),
('Pretoria Station', 'gautrain', -25.7449, 28.1891, 'Pretoria Station', 'Pretoria', 4, 'normal', '2026-04-18T15:55:00Z'),
('Rosebank Gautrain Station', 'gautrain', -26.1190, 28.0426, 'Oxford Road', 'Rosebank', 2, 'normal', '2026-04-18T15:45:00Z'),
('Vilakazi Metrobus Stop', 'metrobus', -26.2663, 27.8587, 'Vilakazi Street', 'Soweto', 5, 'affected', NULL),
('Beyers Naude Metrobus Stop', 'metrobus', -26.1582, 27.9166, 'Beyers Naude Drive', 'Roodepoort', 3, 'normal', NULL),
('Orlando West Taxi Rank', 'taxi_rank', -26.2382, 27.8731, 'Mooki Street', 'Orlando West', 8, 'outage', NULL),
('Hatfield Taxi Rank', 'taxi_rank', -25.7350, 28.2445, 'Jan Shoba Street', 'Hatfield', 6, 'normal', NULL);
SQL
  else
    echo "  - Transit hubs already seeded ($hubCount rows)."
  fi

  local walletCount
  walletCount=$(docker exec greenflow-db psql -U greenflow -d greenflow -tAc "SELECT COUNT(*) FROM wallet_users;")
  if [ "$walletCount" -eq 0 ]; then
    echo "  - Inserting sample wallet users..."
    docker exec -i greenflow-db psql -U greenflow -d greenflow <<'SQL'
INSERT INTO wallet_users (display_name, masked_id, green_credits, total_co2_saved_kg, total_trips, preferred_mode, consent_given, last_trip_at) VALUES
('GreenCommuter1', 'GC-01', 120, 45.3, 14, 'gautrain', 'true', now() - interval '2 days'),
('EcoTraveller2', 'ET-02', 85, 28.5, 9, 'metrobus', 'true', now() - interval '1 day'),
('TaxiSaver3', 'TS-03', 60, 18.2, 6, 'virtual_taxi', 'true', now() - interval '3 days');
SQL
  else
    echo "  - Wallet users already seeded ($walletCount rows)."
  fi

  local txCount
  txCount=$(docker exec greenflow-db psql -U greenflow -d greenflow -tAc "SELECT COUNT(*) FROM credit_transactions;")
  if [ "$txCount" -eq 0 ]; then
    echo "  - Inserting sample credit transactions..."
    docker exec -i greenflow-db psql -U greenflow -d greenflow <<'SQL'
INSERT INTO credit_transactions (user_id, credits, reason, co2_saved_kg, mode) VALUES
(1, 50, 'Weekly ride bonus', 12.1, 'gautrain'),
(2, 30, 'Metrobus commute reward', 7.4, 'metrobus'),
(3, 20, 'Virtual taxi cluster credit', 5.8, 'virtual_taxi');
SQL
  else
    echo "  - Credit transactions already seeded ($txCount rows)."
  fi
}

seed_database

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Environment Configuration:"
echo "   DATABASE_URL=postgresql://greenflow:greenflow_pass@localhost:5432/greenflow"
echo ""
echo "💡 To manage the database:"
echo "   docker exec -it greenflow-db psql -U greenflow -d greenflow"
echo ""
echo "🛑 To stop the database:"
echo "   docker stop greenflow-db"
echo ""
echo "🗑️  To remove the container and database:"
echo "   docker rm greenflow-db"
echo ""
