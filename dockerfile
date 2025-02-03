FROM node:18-slim AS build
WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm i && pnpm run build

FROM node:18-slim
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY ./package.json ./package.json
RUN npm i -g pnpm && pnpm i --prod

EXPOSE 3000
CMD ["node", "./dist/main.js"]