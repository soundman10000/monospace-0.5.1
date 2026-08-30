ARG MONOSPACE_VERSION=v0.5.1
FROM monospace/monospace:${MONOSPACE_VERSION} AS monospace-app

FROM node:22-trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid 65532 nonroot \
  && useradd --uid 65532 --gid 65532 --home-dir /home/nonroot --create-home --shell /usr/sbin/nologin nonroot

WORKDIR /opt/benefits-migrations
COPY benefits-migrations/package.json benefits-migrations/package-lock.json ./
RUN npm ci --omit=dev
COPY benefits-migrations/knexfile.js benefits-migrations/ensure-database.js ./
COPY benefits-migrations/migrations ./migrations

COPY --from=monospace-app /monospace /monospace
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && mkdir -p /uploads \
  && chown -R 65532:65532 /opt/benefits-migrations /uploads /monospace

USER 65532
WORKDIR /monospace
EXPOSE 8100
ENTRYPOINT ["/entrypoint.sh"]
CMD ["./monospace"]
