.PHONY: help install typecheck build dev api frontend db db-setup db-stop db-rm logs clean

# Default target
help:
	@echo "GreenFlow Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install       - Install dependencies (already done)"
	@echo "  make db-setup      - Setup PostgreSQL database in Docker"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Start both API and frontend (interactive menu)"
	@echo "  make api           - Start API server (localhost:8000)"
	@echo "  make frontend      - Start frontend (localhost:5173)"
	@echo ""
	@echo "Quality Checks:"
	@echo "  make typecheck     - Run TypeScript compiler check"
	@echo "  make build         - Build all packages"
	@echo ""
	@echo "Database:"
	@echo "  make db-status     - Show database status"
	@echo "  make db-logs       - Show database logs"
	@echo "  make db-stop       - Stop database container"
	@echo "  make db-rm         - Remove database container"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         - Clean build artifacts and cache"
	@echo ""

install:
	pnpm install

typecheck:
	pnpm run typecheck

build:
	pnpm run build

dev:
	bash ./start.sh

api:
	PORT=8000 pnpm --filter @workspace/api-server run dev

frontend:
	cd artifacts/greenflow && PORT=5173 pnpm run dev

db:
	bash ./start.sh --db-status

db-setup:
	bash ./setup-db.sh

db-status:
	@if docker ps | grep -q greenflow-db; then \
		echo "✓ Database is RUNNING"; \
		docker ps --filter name=greenflow-db --format "table {{.Names}}\t{{.Status}}"; \
	elif docker ps -a | grep -q greenflow-db; then \
		echo "⚠ Database is STOPPED"; \
		docker ps -a --filter name=greenflow-db --format "table {{.Names}}\t{{.Status}}"; \
	else \
		echo "✗ Database container not found"; \
	fi

db-logs:
	docker logs -f greenflow-db

db-stop:
	docker stop greenflow-db

db-rm:
	docker remove greenflow-db

clean:
	find . -type d -name node_modules -prune -exec rm -rf {} \; 2>/dev/null || true
	find . -type d -name dist -prune -exec rm -rf {} \; 2>/dev/null || true
	find . -type d -name .turbo -prune -exec rm -rf {} \; 2>/dev/null || true
	rm -rf ./artifacts/*/dist ./lib/*/dist 2>/dev/null || true

.DEFAULT_GOAL := help
