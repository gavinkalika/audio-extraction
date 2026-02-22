#!/bin/bash

build() {
    echo "Building Docker images..."
    docker-compose build
}

up() {
    echo "Starting containers..."
    docker-compose up -d
    echo "Containers started. Use './run.sh logs' to view logs."
}

logs() {
    docker-compose logs -f app
}

exec_cmd() {
    echo "Executing command in app container: $@"
    docker-compose exec app python "$@"
}

shell() {
    echo "Opening shell in app container..."
    docker-compose exec app /bin/bash
}

down() {
    echo "Stopping containers..."
    docker-compose down
}

case "$1" in
    build)
        build
        ;;
    up)
        up
        ;;
    logs)
        logs
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
        echo "Usage: $0 {build|up|logs|exec|shell|down}"
        echo "  build  - Build Docker images"
        echo "  up     - Start containers in background"
        echo "  logs   - View app logs"
        echo "  exec   - Execute Python command in app container"
        echo "  shell  - Open interactive shell in app container"
        echo "  down   - Stop containers"
        exit 1
        ;;
esac
