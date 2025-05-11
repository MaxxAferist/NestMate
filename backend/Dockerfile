FROM python:3.12-alpine3.21
WORKDIR /app
COPY . /app
RUN apk update && \
    apk add --no-cache \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev && \
    rm -rf /var/cache/apk/*
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]