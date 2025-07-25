FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Chạy frontend bằng lệnh npm start (nếu có)
EXPOSE 3000
CMD ["npm", "start"]
