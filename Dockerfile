# syntax=docker/dockerfile:1
FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r shaks && useradd -r -g shaks shaks

# Set working directory
WORKDIR /app

# Install dependencies first (cache layer)
COPY requirements/base.txt requirements/base.txt
RUN pip install --no-cache-dir -r requirements/base.txt

# Copy project code
COPY . .

# Create directories needed at runtime
RUN mkdir -p logs staticfiles media

# Ownership
RUN chown -R shaks:shaks /app

USER shaks

EXPOSE 8000

ENTRYPOINT ["scripts/entrypoint.sh"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "settings.asgi:application"]
