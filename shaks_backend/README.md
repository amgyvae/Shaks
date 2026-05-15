# Shaks LMS — Backend API

A full-featured Learning Management System built with Django REST Framework.

## Quick Start

```bash
bash scripts/start.sh
```

## API Documentation

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | OpenAPI schema (JSON/YAML) |

## Architecture

- **Apps**: `accounts`, `courses`, `assignments`, `quizzes`, `social`, `chat`, `notifications`, `meetings`, `core`
- **Auth**: JWT via SimpleJWT (`Authorization: Bearer <token>`)
- **WebSockets**: Django Channels + Redis (`ws://host/ws/chat/<room_id>/`)
- **Async Tasks**: Celery + Redis broker
- **Cache**: Redis (db=0)
- **Channel Layer**: Redis (db=2)
- **Celery Broker**: Redis (db=1)

## Verification Commands

```bash
# API health
curl -I http://localhost/admin/login/

# Static files (should return Cache-Control: max-age=...)
curl -I http://localhost/static/admin/css/base.css

# API
curl http://localhost/api/stats/

# Stop web container → nginx returns 502
docker compose stop web && curl -I http://localhost/api/stats/
docker compose start web

# Port 8000 NOT accessible from host
curl http://localhost:8000/  # should fail

# WebSocket
wscat -c "ws://localhost/ws/chat/1/?token=<jwt>"
```

## Environment Variables

Copy `settings/.env.example` to `settings/.env` and fill in your values.
All variables are prefixed with `SHAKS_`.

## Running with Docker

```bash
docker compose up --build
```

Services: `web` (Daphne), `redis`, `celery_worker`, `celery_beat`, `flower` (port 5555), `nginx` (port 80).

## ERD

See `docs/erd.png` for the Entity-Relationship Diagram.
