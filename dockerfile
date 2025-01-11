FROM node:22
WORKDIR /app

COPY package.json ./

RUN npm i -g pnpm
RUN pnpm i

COPY ./src ./src
COPY ./tsconfig.build.json ./tsconfig.build.json
COPY ./tsconfig.json ./tsconfig.json
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]