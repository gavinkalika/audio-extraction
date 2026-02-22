#!/bin/bash

IMAGE_NAME="youtube-cli"
CONTAINER_NAME="youtube-cli-container"

build() {
    echo "Building Docker image..."
    docker build -t $IMAGE_NAME .
}

up() {
    echo "Starting container..."
    docker run -it --rm --name $CONTAINER_NAME $IMAGE_NAME
}

exec_cmd() {
    echo "Executing command in container: $@"
    docker exec -it $CONTAINER_NAME python "$@"
}

shell() {
    echo "Opening shell in container..."
    docker exec -it $CONTAINER_NAME /bin/bash
}

down() {
    echo "Stopping container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

case "$1" in
    build)
        build
        ;;
    up)
        up
        ;;
    exec)
        shift
        exec_cmd "$@"
        ;;
    shell)
        shell
        ;;
    down)
        down
        ;;
    *)
        echo "Usage: $0 {build|up|exec|shell|down}"
        echo "  build  - Build Docker image"
        echo "  up     - Start container"
        echo "  exec   - Execute Python command in running container"
        echo "  shell  - Open interactive shell in container"
        echo "  down   - Stop and remove container"
        exit 1
        ;;
esac
