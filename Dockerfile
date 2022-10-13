FROM node:17

WORKDIR /usr/src/app

COPY . .

RUN npm run build

FROM node:17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=0 /usr/src/app/server ./server
COPY --from=0 /usr/src/app/client/build ./client/build
COPY --from=0 /usr/src/app/.env .

ENV NODE_ENV=production
CMD ["npm", "run", "start"]