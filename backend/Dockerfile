# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# System dependencies required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
