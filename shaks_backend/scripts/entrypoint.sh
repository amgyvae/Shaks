#!/bin/bash
set -e

echo "=== Shaks LMS Entrypoint ==="

# Wait for Redis
echo "Waiting for Redis..."
until python -c "import redis; r = redis.from_url('${SHAKS_REDIS_URL:-redis://redis:6379/0}'); r.ping()" 2>/dev/null; do
    echo "  Redis not ready, sleeping 2s..."
    sleep 2
done
echo "Redis is up."

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Compile translation messages
echo "Compiling messages..."
python manage.py compilemessages || true

# Seed database if requested
if [ "${SHAKS_SEED_DB}" = "true" ]; then
    echo "Seeding database..."
    python manage.py seed
fi

echo "=== Starting server ==="
exec "$@"
