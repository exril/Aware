FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm run prisma:push
RUN npm run prisma:generate
COPY . .
RUN npm run start:prod