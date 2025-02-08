include .env

.PHONY: start deploy clean
.IGNORE: deploy

# docker network name
NETWORK_NAME = $(CONTAINER_NETWORK)

# git commit comment
comment ?= update

# for push code to git
push-code:
	git add .
	git commit -m "$(comment)"
	git push

# check code before commit
pre-commit:
	npm run build

# update code
update:
	git fetch
	git pull

# deploy app
deploy:
	docker network create $(NETWORK_NAME)
	docker compose up -d --build

