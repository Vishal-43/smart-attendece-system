SHELL := /bin/bash

.PHONY: dev prod test migrate

dev:
	docker compose -f docker-compose.dev.yml up --build

prod:
	docker compose -f docker-compose.prod.yml up --build -d

test:
	cd backend-python && pytest -q

migrate:
	cd backend-python && alembic upgrade head
