# Build stage

FROM node:12 as build-image

WORKDIR /usr/src/app

COPY . ./
RUN npm install
RUN npm run build

# Runtime stage

FROM node:12 as runtime-image

WORKDIR /usr/src/app

COPY --from=build-image /usr/src/app/package*.json ./
RUN npm ci --only production
COPY --from=build-image /usr/src/app/build build/

ENV NODE_ENV production
USER node

CMD node build/index.js