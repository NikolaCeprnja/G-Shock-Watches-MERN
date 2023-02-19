# Build images
root-node-vol-build:
	docker build -t root-node-vol -f ./Dockerfile.dev .
server-build:
	cd ./packages/server && $(MAKE) server-build
client-build-dev:
	cd ./packages/client && $(MAKE) client-build
client-build-local:
	cd ./packages/client && $(MAKE) client-build-local
client-build-prod:
	cd ./packages/client && $(MAKE) client-build-prod

# Run containers
root-node-vol-mount:
	docker run -v root-node-vol:/usr/src --rm root-node-vol
mongo-run-dev:
	docker run -dp 27017:27017 --network mern-network --env-file ./packages/server/.env_db --name mongo mongo:4.4.4
server-run-dev:
	docker run -dp 5000:5000 --network mern-network -e HOST_LOCAL=0.0.0.0 --name g-shock-watches-server g-shock-watches/server
client-run-dev:
	docker run -dp 3000:3000 --network mern-network --name g-shock-watches-client g-shock-watches/client

server-run-local:
	NODE_ENV=stage docker run -dp 5000:5000 --network api-network --name g-shock-watches-server-local --restart=unless-stopped g-shock-watches/server:dev
client-run-local:
	NODE_ENV=stage docker run -dp 80:80 --network api-network --name g-shock-watches-client-local --restart=unless-stopped g-shock-watches/client:local

#****************************************************#
build-dev:
	$(MAKE) root-node-vol-build && $(MAKE) root-node-vol-mount \
	&& $(MAKE) server-build && $(MAKE) client-build-dev

run-dev:
	NODE_ENV=development docker compose -f ./docker-compose.dev.yml up -d
#****************************************************#
build-local:
	$(MAKE) server-build && $(MAKE) client-build-local

run-local:
	NODE_ENV=stage docker compose -f ./docker-compose.prod.yml up -d
#****************************************************#
build-prod:
	$(MAKE) server-build-prod && $(MAKE) client-build-prod

run-prod:
	NODE_ENV=production docker compose -f ./docker-compose.prod.yml up -d
#****************************************************#
