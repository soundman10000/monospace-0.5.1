#!/bin/sh
set -eu

cd /directus

echo "Bootstrapping Directus..."
node cli.js bootstrap

echo "Running custom migrations..."
node cli.js database migrate:latest

echo "Starting Directus..."
exec pm2-runtime start ecosystem.config.cjs
