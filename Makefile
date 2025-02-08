include .env

.PHONY: start deploy clean
.IGNORE: deploy

NETWORK_NAME = $(CONTAINER_NETWORK)
GIT_COMMENT ?= "update"

push-code:
	git add .
	git commit -m "$(GIT_COMMENT)"
	git push

pre-commit:
	npm run build
	npm lint

update:
	git fetch
	git pull

deploy:
	docker network create $(NETWORK_NAME)
	docker compose up -d --build

