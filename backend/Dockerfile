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

# Make startup script executable
RUN chmod +x start.sh

EXPOSE 3000

# Start: run migrations + seed + server
CMD ["sh", "start.sh"]
