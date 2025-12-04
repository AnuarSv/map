# Water Map Kz
## 1. Create table in PostgreSQL
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
## 2. Create .env and fill in backend/
```env
# EXAMPLE
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=pern_auth
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=123456
CLIENT_URL=http://localhost:5173
```
## 3. Install npm
```bash
npm i
```

## 4. Run backend
```bash
cd backend/ && npm run dev
```

## 5. Run frontend
```bash
cd map/ && npm run dev
```
