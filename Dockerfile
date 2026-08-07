# Stage 1: install production dependencies
FROM node:24.13.0-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# Stage 2: final production image
FROM node:24.13.0-alpine AS production

LABEL maintainer="Shu-Ting Hsu <chsu17@myseneca.ca>"
LABEL description="Fragments Node.js microservice"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY package*.json ./
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

EXPOSE 8080

CMD ["npm", "start"]