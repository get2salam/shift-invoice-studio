.PHONY: dev build start lint type-check test docker-build docker-run clean

dev:
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npm run lint

type-check:
	npx tsc --noEmit

test:
	npx vitest run

test-watch:
	npx vitest

docker-build:
	docker build -t shift-invoice-studio .

docker-run:
	docker run -p 3000:3000 shift-invoice-studio

docker-compose-up:
	docker compose up --build -d

clean:
	rm -rf .next node_modules
