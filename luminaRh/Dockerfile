FROM node:22-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --legacy-peer-deps

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start"]
