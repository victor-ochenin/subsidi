# Калькулятор субсидий

Приложение для расчета субсидий на основе дохода семьи, количества членов семьи и коэффициента города.

## Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0 (в Docker контейнере)

## Формула расчета

Субсидия рассчитывается по формуле:
```
(доход семьи / количество членов семьи) * коэффициент города
```

## Установка и запуск

### Вариант 1: Запуск в Docker (рекомендуется)

1. Создайте файл `.env` в корне проекта:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=subsidi_user
DB_PASSWORD=subsidi_password
DB_NAME=subsidi_db
MYSQL_ROOT_PASSWORD=rootpassword
```

2. Запустите все сервисы:

```bash
docker-compose up -d
```

Это создаст и запустит:
- MySQL контейнер с предустановленными данными (10 городов с коэффициентами)
- Next.js приложение

Откройте [http://localhost:3000](http://localhost:3000) в браузере.


## Структура проекта

```
subsidi/
├── app/
│   ├── api/
│   │   ├── cities/route.ts      # API для получения списка городов
│   │   └── calculate/route.ts   # API для расчета субсидии
│   ├── page.tsx                 # Главная страница с формой
│   └── layout.tsx
├── mysql/
│   ├── db.ts                    # Подключение к базе данных
│   └── init.sql                 # SQL скрипт для инициализации БД
├── docker-compose.yml           # Конфигурация Docker контейнеров
├── Dockerfile                   # Dockerfile для Next.js приложения
└── package.json
```

## API Endpoints

### GET /api/cities

Получение списка всех городов с коэффициентами.

**Ответ:**
```json
{
  "success": true,
  "cities": [
    {
      "id": 1,
      "city_name": "Москва",
      "coefficient": 1.5
    },
    ...
  ]
}
```

### POST /api/calculate

Расчет субсидии.

**Тело запроса:**
```json
{
  "cityId": 1,
  "familyIncome": 50000,
  "familyMembers": 3
}
```

**Ответ:**
```json
{
  "success": true,
  "subsidy": 25000,
  "calculationDetails": {
    "cityName": "Москва",
    "coefficient": 1.5,
    "familyIncome": 50000,
    "familyMembers": 3,
  }
}
```

## Остановка контейнеров

```bash
docker-compose down
```

Для полного удаления данных:

```bash
docker-compose down -v
```

## Пересборка приложения

После изменений в коде может потребоваться пересборка:

```bash
docker-compose up -d --build
```

## Разработка

Приложение использует:
- Next.js App Router
- Server Components и Client Components
- MySQL connection pooling для эффективной работы с БД
- Валидацию данных на клиенте и сервере
