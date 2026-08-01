# 1. Pilih Base Image
FROM node:18-alpine

# 2. Tentukan Direktori Kerja di dalam Container
WORKDIR /app

# 3. Salin file manajemen paket
COPY package*.json ./

# 4. Install dependensi
RUN npm install --only=production

# 5. Salin seluruh kode aplikasi
COPY . .

# 6. Deklarasikan Port
EXPOSE 3000

# 7. Perintah Utama untuk Menjalankan Aplikasi
CMD ["node", "index.js"]