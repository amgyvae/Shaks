#!/bin/bash
# One-command setup script for local development.
# Usage: bash scripts/start.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/settings/.env"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[start.sh]${NC} $1"; }
warn() { echo -e "${YELLOW}[start.sh]${NC} $1"; }
fail() { echo -e "${RED}[start.sh] FAILED: $1${NC}"; exit 1; }

log "Step 1: Validating environment variables..."
if [ ! -f "$ENV_FILE" ]; then
    warn ".env not found. Creating from .env.example..."
    cp "$PROJECT_DIR/settings/.env.example" "$ENV_FILE"
fi

REQUIRED_VARS=(SHAKS_SECRET_KEY SHAKS_REDIS_URL SHAKS_CELERY_BROKER_URL)
for var in "${REQUIRED_VARS[@]}"; do
    val=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -z "$val" ]; then
        fail "Required variable '$var' is missing or empty in settings/.env"
    fi
done
log "Environment variables OK."

log "Step 2: Setting up virtual environment..."
cd "$PROJECT_DIR"
if [ ! -d "venv" ]; then
    python3 -m venv venv || fail "Failed to create virtual environment"
fi
source venv/bin/activate || fail "Failed to activate virtual environment"
pip install -q -r requirements/base.txt || fail "Failed to install dependencies"
log "Virtual environment ready."

log "Step 3: Running migrations..."
python manage.py migrate --noinput || fail "Migrations failed"

log "Step 4: Collecting static files..."
python manage.py collectstatic --noinput || fail "collectstatic failed"

log "Step 5: Compiling translations..."
python manage.py compilemessages 2>/dev/null || warn "compilemessages skipped (gettext may not be installed)"

log "Step 6: Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(phone_number='+70000000000').exists():
    User.objects.create_superuser(phone_number='+70000000000', password='admin123', full_name='Admin')
    print('Superuser created.')
else:
    print('Superuser already exists.')
" || warn "Superuser creation skipped"

log "Step 7: Seeding database..."
python manage.py seed || warn "Seed skipped or already done"

log "Step 8: Starting development server..."
echo ""
echo "========================================="
echo "  Shaks LMS is starting up"
echo "========================================="
echo "  API:         http://localhost:8000/api/"
echo "  Swagger UI:  http://localhost:8000/api/docs/"
echo "  ReDoc:       http://localhost:8000/api/redoc/"
echo "  Admin:       http://localhost:8000/admin/"
echo "-----------------------------------------"
echo "  Superuser phone: +70000000000"
echo "  Superuser pass:  admin123"
echo "========================================="
python manage.py runserver 0.0.0.0:8000
