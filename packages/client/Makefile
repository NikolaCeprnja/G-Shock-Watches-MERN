client-build:
	docker build -t g-shock-watches/client:dev -f ./Dockerfile ../../
client-build-local:
	docker build \
	 -t g-shock-watches/client:local \
	 --build-arg CADDYFILE=./packages/client/Caddyfile.local \
	 -f ./Dockerfile.prod ../../
