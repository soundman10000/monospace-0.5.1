FROM node:24-alpine

RUN apk upgrade --no-cache libcrypto3 libssl3

WORKDIR /app

COPY app/package.json app/package-lock.json app/nuxt.config.ts app/tsconfig.json ./
COPY app/app ./app
RUN npm ci

COPY app/ .

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev"]
