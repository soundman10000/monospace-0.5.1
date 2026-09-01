#!/bin/sh
set -e

if [ "$#" -gt 0 ]; then
  exec monospace-cli "$@"
fi

if [ -z "${MONOSPACE_SOURCE_PASSWORD}" ]; then
  echo "MONOSPACE_SOURCE_PASSWORD is required" >&2
  exit 1
fi

monospace-cli workspace \
  --workspace "${MONOSPACE_WORKSPACE}" \
  --workspace-name "${MONOSPACE_WORKSPACE_NAME}" \
  --description "${MONOSPACE_WORKSPACE_DESCRIPTION}" \
  --color "${MONOSPACE_WORKSPACE_COLOR}" \
  --logo "${MONOSPACE_WORKSPACE_LOGO}"

monospace-cli org \
  --name "Empyrean Benefit Solutions" \
  --color "#0077b7" \
  --logo /cli/assets/images/empLogo.png

exec monospace-cli source \
  --workspace "${MONOSPACE_WORKSPACE}" \
  --source "${MONOSPACE_SOURCE_NAME}" \
  --host "${MONOSPACE_SOURCE_HOST}" \
  --port "${MONOSPACE_SOURCE_PORT}" \
  --user "${MONOSPACE_SOURCE_USER}" \
  --db-password "${MONOSPACE_SOURCE_PASSWORD}" \
  --dbname "${MONOSPACE_SOURCE_DATABASE}"
