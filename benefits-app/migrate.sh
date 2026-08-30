#!/bin/sh
set -eu

cd /opt/benefits-app/migrations

echo "Running benefits catalog migrations..."

n=0
until node ./ensure-database.js && node ../node_modules/knex/bin/cli.js migrate:latest; do
  n=$((n + 1))
  if [ "$n" -ge 15 ]; then
    echo "Benefits migrations failed after ${n} attempts" >&2
    exit 1
  fi
  echo "Waiting for postgres before retrying migrations (${n}/15)..."
  sleep 2
done

echo "Benefits migrations complete."
