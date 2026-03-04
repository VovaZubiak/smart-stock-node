# Smart Stock - Warehouse Management System

It features strict role-based access control, allowing Administrators to manage inventory and personnel, while Stockkeepers process incoming and outgoing transactions. The system ensures transparent tracking of all stock movements and provides automated PDF reporting for streamlined inventory audits.

## Technologies
- **Backend:** NestJS, MikroORM, PostgreSQL, JWT Auth, Swagger
- **Frontend:** React, Lucide Icons, html2pdf.js

### 1. Prerequisites
-  [Node.js](https://nodejs.org/) v24.12.0+
-  [PostgreSQL](https://www.postgresql.org/) v18.0+

### 2. Database Settings
1. Create a database named `smart_stock`.
```bash
psql -U postgres -c "CREATE DATABASE smart_stock;"
```

### 3. Backend launch
```bash
cd smart-stock-backend
npm install

# Створіть файл .env на основі .env.example та впишіть туди свій пароль до бази даних

npm run start
```
### 4. Frontend launch

```bash
cd smart-stock-frontend

npm install

npm start
```
