#!/bin/bash
set -e

echo "=== WaterMap Rebuild ==="

# Parse args
BACKEND=false
FRONTEND=false
ALL=false

if [ $# -eq 0 ]; then
    ALL=true
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--backend)
            BACKEND=true
            shift
            ;;
        -f|--frontend)
            FRONTEND=true
            shift
            ;;
        -a|--all)
            ALL=true
            shift
            ;;
        *)
            echo "Usage: ./rebuild.sh [-b|--backend] [-f|--frontend] [-a|--all]"
            exit 1
            ;;
    esac
done

if $ALL; then
    BACKEND=true
    FRONTEND=true
fi

# Rebuild backend
if $BACKEND; then
    echo "Rebuilding backend..."
    docker compose build backend --no-cache
    docker compose up -d backend
    echo "Backend rebuilt"
fi

# Rebuild frontend
if $FRONTEND; then
    echo "Rebuilding frontend..."
    docker compose build frontend --no-cache
    docker compose up -d frontend
    echo "Frontend rebuilt"
fi

# Show status
echo ""
echo "=== Status ==="
docker compose ps

echo ""
echo "Done. Services available at:"
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:5000"
