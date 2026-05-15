#!/bin/bash
echo "Starting MLS Backend..."
cd "$(dirname "$0")/backend"
venv/bin/python manage.py runserver 0.0.0.0:8000
