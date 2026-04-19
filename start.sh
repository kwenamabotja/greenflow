#!/bin/bash

# GreenFlow Quick Start Script
# This script provides an interactive menu for common development tasks

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

if [ -f .env.local ]; then
  set -a
  # shellcheck source=/dev/null
  source .env.local
  set +a
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}╭─────────────────────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│${NC} GreenFlow Development Server ${GREEN}✓${NC}                      ${BLUE}│${NC}"
    echo -e "${BLUE}╰─────────────────────────────────────────────────────╯${NC}"
}

print_menu() {
    echo ""
    echo -e "${GREEN}Available Commands:${NC}"
    echo ""
    echo "  1. Setup database (Docker + schema)"
    echo "  2. Start API server (localhost:8000)"
    echo "  3. Start frontend (localhost:5173)"
    echo "  4. Start both (requires 2 terminals)"
    echo "  5. Run typecheck"
    echo "  6. Build all packages"
    echo "  7. View database status"
    echo "  8. Show environment info"
    echo "  0. Exit"
    echo ""
}

setup_database() {
    echo -e "${YELLOW}Setting up database...${NC}"
    bash ./setup-db.sh
}

start_api() {
    echo -e "${YELLOW}Starting API server on port 8000...${NC}"
    echo -e "${GREEN}Press Ctrl+C to stop${NC}"
    echo ""
    PORT=8000 pnpm --filter @workspace/api-server run dev
}

start_frontend() {
    echo -e "${YELLOW}Starting frontend on port 5173...${NC}"
    echo -e "${GREEN}Press Ctrl+C to stop${NC}"
    echo ""
    cd artifacts/greenflow
    PORT=5173 pnpm run dev
}

start_both() {
    echo -e "${YELLOW}Starting both servers...${NC}"
    echo ""
    echo -e "${BLUE}Instructions:${NC}"
    echo "  Terminal 1 (API): PORT=8000 pnpm --filter @workspace/api-server run dev"
    echo "  Terminal 2 (Frontend): cd artifacts/greenflow && PORT=5173 pnpm run dev"
    echo ""
    echo -e "${YELLOW}Open new terminal windows and run the commands above${NC}"
    echo ""
    echo -e "${GREEN}Frontend will be at: http://localhost:5173${NC}"
    echo -e "${GREEN}API Server at: http://localhost:8000${NC}"
}

run_typecheck() {
    echo -e "${YELLOW}Running TypeScript checks...${NC}"
    pnpm run typecheck
    echo -e "${GREEN}✓ TypeScript check passed${NC}"
}

run_build() {
    echo -e "${YELLOW}Building all packages...${NC}"
    pnpm run build
    echo -e "${GREEN}✓ Build complete${NC}"
}

show_db_status() {
    echo -e "${YELLOW}Database Status:${NC}"
    echo ""
    if docker ps | grep -q greenflow-db; then
        echo -e "${GREEN}✓ PostgreSQL container is RUNNING${NC}"
        echo ""
        docker ps --filter name=greenflow-db --format "table {{.Names}}\t{{.Status}}"
    elif docker ps -a | grep -q greenflow-db; then
        echo -e "${YELLOW}⚠ PostgreSQL container exists but is STOPPED${NC}"
        echo ""
        echo "Start it with: docker start greenflow-db"
    else
        echo -e "${RED}✗ PostgreSQL container not found${NC}"
        echo ""
        echo "Create it with: bash ./setup-db.sh"
    fi
}

show_env_info() {
    echo -e "${YELLOW}Environment Information:${NC}"
    echo ""
    echo "Node version: $(node --version)"
    echo "pnpm version: $(pnpm --version)"
    echo "npm version: $(npm --version)"
    echo ""
    echo "PostgreSQL: $(docker --version 2>/dev/null || echo 'Docker not found')"
    echo ""
    
    if [ -f .env.local ]; then
        echo -e "${GREEN}✓ .env.local exists${NC}"
        echo ""
        echo "Key variables:"
        grep -E "^DATABASE_URL|^PORT|^NODE_ENV|^CLERK_" .env.local | sed 's/^/  /'
    else
        echo -e "${YELLOW}⚠ .env.local not found${NC}"
        echo "  Copy from .env.example: cp .env.example .env.local"
    fi
}

# Main menu loop
print_header
echo ""
echo "GreenFlow Development Server"
echo "Project: $PROJECT_ROOT"
echo ""

if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    print_menu
    echo -e "${BLUE}Examples:${NC}"
    echo "  bash ./start.sh                # Interactive menu"
    echo "  bash ./start.sh --db           # Setup database"
    echo "  bash ./start.sh --api          # Start API server"
    echo "  bash ./start.sh --frontend     # Start frontend"
    exit 0
fi

# Handle command line arguments
case "$1" in
    --db|setup-db)
        setup_database
        exit 0
        ;;
    --api|start-api)
        start_api
        exit 0
        ;;
    --frontend|start-frontend)
        start_frontend
        exit 0
        ;;
    --both|start-both)
        start_both
        exit 0
        ;;
    --typecheck)
        run_typecheck
        exit 0
        ;;
    --build)
        run_build
        exit 0
        ;;
    --db-status)
        show_db_status
        exit 0
        ;;
    --env-info)
        show_env_info
        exit 0
        ;;
esac

# Interactive menu
while true; do
    print_menu
    read -p "$(echo -e ${GREEN}Enter your choice:${NC} )" choice
    
    case "$choice" in
        1)
            setup_database
            ;;
        2)
            start_api
            ;;
        3)
            start_frontend
            ;;
        4)
            start_both
            ;;
        5)
            run_typecheck
            ;;
        6)
            run_build
            ;;
        7)
            show_db_status
            ;;
        8)
            show_env_info
            ;;
        0)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "$(echo -e ${YELLOW}Press Enter to continue...${NC})"
done
