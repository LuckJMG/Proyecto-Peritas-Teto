# Docker commands
start:
	sudo docker compose up --build -d

stop:
	sudo docker compose down

nuke:
	sudo docker compose down --volumes
	sudo docker compose build --no-cache
	sudo docker compose up --build

logs-db:
	sudo docker compose logs -f db

logs-backend:
	sudo docker compose logs -f backend

rebuild:
	sudo docker compose up --build -d


# Database commands
db-shell:
	sudo docker compose exec db psql -U peritas -d peritas_db

db-migrate:
	sudo docker compose exec backend alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	sudo docker compose exec backend alembic upgrade head

db-downgrade:
	sudo docker compose exec backend alembic downgrade -1

db-reset:
	sudo docker compose down --volumes
	sudo docker compose up -d db
	sleep 3
	cd backend && alembic upgrade head

db-seed:
	cd backend && python scripts/seed_data.py

# Development commands
install:
	cd backend && pip install -r requirements.txt

dev:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	cd backend && PYTHONPATH=. pytest tests/ -v

format:
	cd backend && black app/
	cd backend && isort app/

lint:
	cd backend && flake8 app/

# Setup
setup:
	cd backend && chmod +x scripts/setup.sh
	cd backend && ./scripts/setup.sh

.PHONY: start stop rebuild logs-db logs-api db-shell db-migrate db-upgrade db-downgrade db-reset db-seed install dev test format lint setup
