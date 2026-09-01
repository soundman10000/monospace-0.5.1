#!/bin/sh
set -eu

DB_NAME="${DIRECTUS_DB:-directus}"

n=0
until pg_isready -q; do
  n=$((n + 1))
  if [ "$n" -ge 15 ]; then
    echo "postgres is not ready" >&2
    exit 1
  fi
  sleep 2
done

if psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  echo "database ${DB_NAME} already exists"
  exit 0
fi

psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\""
echo "created database ${DB_NAME}"
