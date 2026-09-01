#!/bin/sh
set -e

if [ "$#" -gt 0 ]; then
  exec monospace-cli "$@"
fi

monospace-cli workspace \
  --workspace "${MONOSPACE_WORKSPACE}" \
  --workspace-name "${MONOSPACE_WORKSPACE_NAME}"

exec monospace-cli source \
  --workspace "${MONOSPACE_WORKSPACE}" \
  --source "${MONOSPACE_SOURCE_NAME}" \
  --host "${MONOSPACE_SOURCE_HOST}" \
  --port "${MONOSPACE_SOURCE_PORT}" \
  --user "${MONOSPACE_SOURCE_USER}" \
  --db-password "${MONOSPACE_SOURCE_PASSWORD}" \
  --dbname "${MONOSPACE_SOURCE_DATABASE}"
