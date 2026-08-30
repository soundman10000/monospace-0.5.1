#!/bin/sh
set -eu

echo "Running benefits catalog migrations..."

n=0
until (
  cd /opt/benefits-migrations
  node ./ensure-database.js
  ./node_modules/.bin/knex migrate:latest
); do
  n=$((n + 1))
  if [ "$n" -ge 15 ]; then
    echo "Benefits migrations failed after ${n} attempts" >&2
    exit 1
  fi
  echo "Waiting for postgres before retrying migrations (${n}/15)..."
  sleep 2
done

echo "Benefits migrations complete."
cd /monospace
exec "$@"
