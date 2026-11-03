FROM node:24.22.2-bookworm-slim

ARG APP_UID=1000
ARG APP_GID=1000
RUN groupmod -o -g "$APP_GID" node \
    && usermod -o -u "$APP_UID" -g "$APP_GID" node \
    && mkdir -p /app/node_modules /app/.next \
    && chown -R node:node /app /home/node

WORKDIR /app
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]
