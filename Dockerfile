# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json และ package-lock.json เท่านั้น
COPY package.json package-lock.json ./

# ติดตั้ง dependencies แบบ production เท่านั้น
RUN npm ci --omit=dev

# Copy โค้ดที่เหลือ
COPY . . 

# Build Next.js
RUN npm run build

# Stage 2: Production Image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy เฉพาะไฟล์ที่จำเป็นจาก builder
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/.next .next/
COPY --from=builder /usr/src/app/node_modules node_modules/
COPY --from=builder /usr/src/app/public public/

EXPOSE 3000

# ใช้ next start ซึ่งเหมาะกับ production
CMD ["npx", "next", "start"]
