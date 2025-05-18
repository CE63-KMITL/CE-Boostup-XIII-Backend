FROM node:23-alpine AS pnpm
WORKDIR /app

COPY package.json package.json

RUN npm i -g pnpm && pnpm i

FROM pnpm AS build
WORKDIR /app

COPY . .

RUN pnpm run build && pnpm prune --prod

FROM node:23-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/email.html ./email.html
COPY --from=build /app/node_modules/ ./node_modules/

EXPOSE 3000
CMD ["node", "./dist/main.js"]