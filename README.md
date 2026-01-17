# WaterMap

Система управления гидрологическими данными Казахстана.

## Требования

- Docker 24+
- Docker Compose v2

## Запуск

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/watermap.git
cd watermap

# Создать .env файл
cp .env.example .env

# Запустить все сервисы
docker compose up -d

# Инициализировать базу данных (первый запуск)
docker compose exec backend ./init
```

Приложение доступно: http://localhost:8080

## Учетные данные по умолчанию

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin1@watermap.kz | 123456 |
| Expert | expert1@watermap.kz | 123456 |
| User | user1@watermap.kz | 123456 |

## Сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| Frontend | 8080 | React + Nginx |
| Backend | 8081 | Go API |
| PostgreSQL | 5432 | База данных |
| Redis | 6379 | Кэш |

## Команды

```bash
# Остановить
docker compose down

# Пересобрать
docker compose build --no-cache

# Логи
docker compose logs -f backend

# Перезапустить один сервис
docker compose restart frontend
```

## Структура

```
├── backend/          # Go API
├── frontend/         # React приложение
├── docker-compose.yml
└── README.md
```

## Лицензия

См. [LICENSE](LICENSE)
