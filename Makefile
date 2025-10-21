start:
	sudo docker compose --profile local up --build

stop:
	sudo docker compose down

rebuild:
	sudo docker compose down --volumes
	sudo docker compose build --no-cache
	sudo docker compose --profile local up --build

logs-db:
	sudo docker compose logs -f peritas_db

logs-api:
	sudo docker compose logs -f peritas_api