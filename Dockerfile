# ===== STAGE 1: Build & Dependencies =====
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# npm ci lebih cepat dan konsisten dibanding npm install untuk lingkungan CI/Production
RUN npm ci --only=production

# ===== STAGE 2: Production Runtime =====
FROM node:18-alpine AS runner
WORKDIR /app

# Salin folder node_modules yang sudah bersih dari STAGE 1
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Keamanan Tambahan: Gunakan user non-root bawaan Node.js
USER node

EXPOSE 3000
CMD ["node", "index.js"]