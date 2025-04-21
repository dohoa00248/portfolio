
FROM node:22

# Đặt thư mục làm việc trong container là /app
WORKDIR /app

# Copy package.json và package-lock.json vào thư mục làm việc trong container
COPY package*.json ./

# Cài đặt các dependencies từ package.json
RUN npm install

# Copy toàn bộ mã nguồn (bao gồm server.js) vào container
COPY src/ ./src/

# Mở cổng 3000 (hoặc cổng bạn muốn)
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["node", "src/server.js"]