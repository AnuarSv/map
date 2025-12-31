# WaterMap Pro

Kazakhstan water resources mapping and management system.

## Requirements

- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

## Quick Start

### 1. Database

Start PostgreSQL:
```bash
docker run -d --name watermap-db \
  -e POSTGRES_USER=watermap \
  -e POSTGRES_PASSWORD=watermap \
  -e POSTGRES_DB=watermap \
  -p 5432:5432 postgres:15
```

### 2. Backend

```bash
cd backend

# Create .env
cat > .env << EOF
DATABASE_URL=postgres://watermap:watermap@localhost:5432/watermap?sslmode=disable
JWT_SECRET=your-secret-key
EOF

# Initialize database (creates tables + seeds users)
go run ./cmd/init/

# Start server
go run ./cmd/server/
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Application runs at http://localhost:5174

## Default Accounts

| Role   | Username | Password |
|--------|----------|----------|
| Admin  | admin1   | 123456   |
| Expert | expert1  | 123456   |
| User   | user1    | 123456   |

Login format: `{username}@watermap.kz`

## Project Structure

```
backend/
  cmd/
    server/     - Main API server
    init/       - Database initialization
  internal/
    adapter/    - Handlers, repositories
    domain/     - Entities, business logic
    
frontend/
  src/
    pages/      - Route components
    components/ - Reusable UI
    store/      - Zustand state
```

## API Endpoints

| Method | Endpoint           | Description       |
|--------|-------------------|-------------------|
| POST   | /api/auth/login   | Authenticate      |
| POST   | /api/auth/register| Create account    |
| GET    | /api/admin/users  | List users (admin)|
| GET    | /api/objects      | List water objects|

## License

Proprietary. See LICENSE file.
