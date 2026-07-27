# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# System dependencies required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Note: prisma generate sera ajouté ici quand les modèles seront définis dans schema.prisma

EXPOSE 3000

CMD ["npm", "run", "dev"]
