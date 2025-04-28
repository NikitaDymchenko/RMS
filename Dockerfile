# Dockerfile
FROM node:18-alpine

# Рабочая директория в контейнере
WORKDIR /app

# Сначала копируем только package-файлы, чтобы ускорить npm install
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем весь остальной код
COPY . .

# По умолчанию команда запуска
CMD ["npm", "start"]
