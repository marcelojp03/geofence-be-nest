# Geofence Backend

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.1-blue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-green.svg)](https://postgis.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

REST API backend for real-time geofencing system with multi-tenant architecture. Tracks children locations within school perimeters using PostGIS spatial queries.

> **Project Documentation:** For detailed information about architecture, API endpoints, and system design, see [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md)

---

## Prerequisites

- Node.js >= 18.x
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/marcelojp03/geofence-be-nest.git
cd geofence-be-nest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database?schema=sig"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup database

Run Prisma migrations to create tables and indexes:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

**Note:** PostGIS geometry columns (`schools.geom`, `child_positions.geom`) must be created manually. See migration files in `prisma/migrations/` for SQL scripts.

---

## Running the Application

### Development mode (with hot-reload)

```bash
npm run start:dev
```

Server will start on `http://localhost:3000`

### Production mode

```bash
npm run build
npm run start:prod
```

---

## API Testing

Import `postman_collection.json` into Postman to test all 53 endpoints.

The collection includes:
- Environment variables auto-configuration
- JWT token auto-capture on login
- Complete flow test (school → user → child → device → tracking)

---

## Project Structure

```
src/
├── auth/           # JWT authentication & authorization
├── schools/        # School management (CRUD)
├── users/          # User management (admins & parents)
├── children/       # Child registration
├── devices/        # Mobile device management
├── tracking/       # GPS position tracking (public endpoint)
├── alerts/         # Geofence alerts (enter/exit area)
└── prisma/         # Database service & schema
```

---

## Key Features

- **Multi-tenant architecture** by schoolId
- **Role-based access control** (SCHOOL_ADMIN, PARENT)
- **PostGIS spatial queries** for geofencing (ST_Within, ST_MakePoint)
- **Public tracking endpoint** for mobile apps (no authentication)
- **Automatic alert generation** on area entry/exit
- **JWT authentication** with Passport strategies

---

## Additional Documentation

| Document | Description |
|----------|-------------|
| [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md) | Complete backend status, models, endpoints, architecture |
| [ENDPOINTS_COMPLETOS.md](ENDPOINTS_COMPLETOS.md) | Full API reference with request/response examples |
| [ARQUITECTURA_CLIENTES.md](ARQUITECTURA_CLIENTES.md) | Client architecture (Flutter apps, React panel, QGIS) |
| [SMOKE_TESTS.md](SMOKE_TESTS.md) | PowerShell scripts for API testing |

---

## Tech Stack

- **Framework:** NestJS 11.0.1
- **ORM:** Prisma 6.16.1
- **Database:** PostgreSQL + PostGIS
- **Authentication:** JWT with Passport
- **Validation:** class-validator, class-transformer
- **Language:** TypeScript 5.7.3

---

## License

This project is licensed under the MIT License.
