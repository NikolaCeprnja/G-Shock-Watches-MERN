# Build images
root-node-vol-build:
	docker build -t root-node-vol .
server-build:
	cd ./packages/server && $(MAKE) server-build
client-build-dev:
	cd ./packages/client && $(MAKE) client-build
client-build-local:
	cd ./packages/client && $(MAKE) client-build-local

# Run containers
root-node-vol-mount:
	docker run -v root-node-vol:/usr/src --rm root-node-vol
mongo-run-dev:
	docker run -dp 27017:27017 --network mern-network --env-file ./packages/server/.env_db --name mongo mongo:4.4.4
server-run-dev:
	docker run -dp 5000:5000 --network mern-network -e HOST_LOCAL=0.0.0.0 --name g-shock-watches-server g-shock-watches/server
client-run-dev:
	docker run -dp 3000:3000 --network mern-network --name g-shock-watches-client g-shock-watches/client

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
