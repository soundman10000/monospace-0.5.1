#!/bin/sh
set -e
mkdir -p /keys

if ! [ -f /keys/jwt_private.pem ] || ! [ -f /keys/jwt_public.pem ] || ! [ -f /keys/kms_master.key ]; then
  openssl genpkey -algorithm ED25519 -out /keys/jwt_private.pem
  openssl pkey -in /keys/jwt_private.pem -pubout -out /keys/jwt_public.pem
  openssl rand -base64 32 | tr -d '\n' > /keys/kms_master.key
  echo "Keys generated."
else
  echo "Keys already exist, skipping generation."
fi

chown 65532:65532 /keys/jwt_private.pem /keys/jwt_public.pem /keys/kms_master.key || true
chmod 600 /keys/jwt_private.pem /keys/jwt_public.pem /keys/kms_master.key || true
