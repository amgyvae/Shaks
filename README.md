# SHAKS LMS

> Full-stack Learning Management System — Django REST Framework + React + TypeScript.
> University team project · KBTU 2026 · Advanced Django Backend · SHAKS

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Python 3.11, Django 4.x, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL, SQLite (dev) |
| Async | Celery + Redis |
| Real-time | Django Channels (WebSockets) |
| Frontend | React, TypeScript, Vite, TailwindCSS |
| DevOps | Docker, Docker Compose, Nginx |
| Docs | Swagger UI, ReDoc, OpenAPI |

---

## Features

### Authentication & Roles
- JWT authentication (access + refresh tokens)
- Three roles: **Student**, **Teacher**, **Admin**
- Registration, login, password management

### Student
- Browse and enroll in courses
- View modules and lessons
- Submit assignments
- Take quizzes and track results
- Social feed and notifications

### Teacher
- Create and manage courses, modules, lessons
- Publish assignments and quizzes
- Review and grade student submissions
- Schedule meetings

### Platform
- Real-time chat (WebSockets)
- Email notifications (async via Celery)
- Multilingual support (locale/)
- REST API with full OpenAPI documentation
- Dockerized deployment with Nginx

---

## Project Structure

```
Shaks/
│
├── shaks_backend/
│   ├── apps/
│   │   ├── accounts/        # Users, roles, JWT auth
│   │   ├── courses/         # Courses, modules, lessons
│   │   ├── assignments/     # Assignments & submissions
│   │   ├── quizzes/         # Quizzes & attempts
│   │   ├── chat/            # Real-time messaging
│   │   ├── social/          # Social feed
│   │   ├── meetings/        # Scheduled meetings
│   │   ├── notifications/   # Push & email notifications
│   │   └── core/            # Shared utilities & base classes
│   ├── settings/            # Dev / prod / base configs
│   ├── requirements/        # Pinned dependencies
│   ├── docs/                # API docs & architecture
│   ├── nginx/               # Nginx config
│   ├── scripts/             # Utility scripts
│   ├── locale/              # i18n translations
│   ├── templates/           # Email templates
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── manage.py
│
└── shaks_frontend/
    ├── src/
    │   ├── api/             # Axios clients & endpoints
    │   ├── assets/          # Static assets
    │   ├── components/      # Reusable UI components
    │   ├── context/         # React context providers
    │   ├── hooks/           # Custom React hooks
    │   └── pages/
    │       ├── admin/       # Admin dashboard
    │       ├── auth/        # Login, register
    │       ├── student/     # Student views
    │       ├── teacher/     # Teacher views
    │       └── LandingPage.tsx
    ├── public/
    ├── index.html
    └── vite.config.ts
```

---

## Quick Start

### Run with Docker (recommended)

```bash
git clone https://github.com/amgyvae/Shaks.git
cd Shaks

# Configure environment
cp shaks_backend/.env.example shaks_backend/.env

# Start all services
docker-compose up --build
```

### Run manually

**Backend:**
```bash
cd shaks_backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements/local.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd shaks_frontend
npm install
npm run dev
```

---

## Environment Variables

Create `shaks_backend/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgres://user:password@localhost:5432/shaks_db
REDIS_URL=redis://localhost:6379/0

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-password
```

---

## API Documentation

Start the backend and open:

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc |
| `/api/schema/` | OpenAPI JSON/YAML |

---

## Team

All team members contributed as **Backend Developers**.

| GitHub | Name |
|--------|------|
| [@amgyvae](https://github.com/amgyvae) | Margulan Sharipzhan |
| [@Nuraiikkka](https://github.com/Nuraiikkka) | Nurai Aitbazar |
| [@AskarovaAkbota](https://github.com/AskarovaAkbota) | Akbota Askarova |

---

## License

© SHAKS · KBTU 2026 · Advanced Django Backend Course

This project was developed as a university course project at Kazakh-British Technical University.
