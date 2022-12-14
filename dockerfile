
# Build Pipeline
FROM node:14.16.0 As development

WORKDIR /usr/src/app

# COPY package.json ./

# COPY package-lock.json ./

# COPY node_modules ./

# RUN npm install

COPY . ./

RUN npm run build


# Production Pipeline
FROM node:14.16.0 as production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
