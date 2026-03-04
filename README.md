# Smart Stock - Warehouse Management System

Система складського обліку з розподілом ролей (Admin/Storekeeper), генерацією PDF-звітів та історією транзакцій.

## Технології
- **Backend:** NestJS, MikroORM, PostgreSQL, JWT Auth, Swagger
- **Frontend:** React, Lucide Icons, html2pdf.js

### 1. Попередні вимоги
- Встановлений [Node.js](https://nodejs.org/) v24.12.0+
- Встановлений [PostgreSQL](https://www.postgresql.org/) v18.0+

### 2. Налаштування Бази Даних
1. Створіть базу даних з назвою `smart_stock`.
```bash
psql -U postgres -c "CREATE DATABASE smart_stock;"
```

### 3. Запуск Бекенду
```bash
cd smart-stock-backend
npm install

# Створіть файл .env на основі .env.example та впишіть туди свій пароль до бази даних

npm run start
```
### 4. Запуск Фронтенду

```bash
cd smart-stock-frontend

npm install

npm start
```
