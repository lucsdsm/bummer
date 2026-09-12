FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
    && pip install \
        "Django>=5.1,<5.3" \
        "djangorestframework>=3.15,<3.17" \
        "django-cors-headers>=4.6,<4.8" \
        "psycopg[binary]>=3.2,<3.3"

EXPOSE 8000