up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

rebuild-backend:
	docker compose build backend && docker compose up backend -d

rebuild-frontend:
	docker compose build frontend && docker compose up frontend -d
