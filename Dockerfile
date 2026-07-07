# Dockerfile for the Fragments microservice
# This file defines the instructions used to build
# a Docker image for the Fragments Node.js application.

# Use the official Node.js image that matches my local Node version
FROM node:24.13.0-alpine

LABEL maintainer="Shu-Ting Hsu <chsu17@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
# COPY package.json package-lock.json ./
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --omit=dev

# Copy src to /app/src/
COPY ./src ./src

COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080