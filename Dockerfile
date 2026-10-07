FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so this one
# needs to be a build ARG/ENV, not a runtime-only var like the rest of .env.example
# (SMTP_*, TURNSTILE_SECRET_KEY) - those are read at request time and must only ever
# come from the container's runtime environment, never baked in here.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Needed during `next build` itself (Server Components run at build time for static
# generation) - not inlined into the client bundle like NEXT_PUBLIC_* above, but still only
# available to this RUN step via ARG/ENV, same mechanism.
ARG STRAPI_URL
ENV STRAPI_URL=$STRAPI_URL
ARG STRAPI_API_TOKEN
ENV STRAPI_API_TOKEN=$STRAPI_API_TOKEN
RUN bun run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
