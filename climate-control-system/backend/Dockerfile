FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
# Copy migration SQL files (required for migrations at runtime)
COPY database ./database
# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]

