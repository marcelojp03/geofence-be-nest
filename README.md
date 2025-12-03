# Geofence Backend

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.1-blue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-green.svg)](https://postgis.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-orange.svg)](https://firebase.google.com/)

REST API backend for real-time geofencing system with multi-tenant architecture. Tracks children locations within school perimeters using PostGIS spatial queries and sends push notifications via Firebase Cloud Messaging.

---

## Features

- **Multi-tenant architecture** by schoolId
- **Role-based access control** (SCHOOL_ADMIN, PARENT)
- **PostGIS spatial queries** for geofencing (ST_Within, ST_MakePoint)
- **Automatic alert generation** on area entry/exit
- **Push notifications** via Firebase Cloud Messaging (FCM)
- **JWT authentication** with unique token per login
- **Standardized API responses** with consistent format

---

## Prerequisites

- Node.js >= 18.x
- PostgreSQL 14+ with PostGIS extension
- Firebase project (for push notifications)
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
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# Firebase Admin SDK (for push notifications)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Setup database

```bash
npx prisma migrate deploy
npx prisma generate
```

**Note:** PostGIS geometry columns must be created manually. See migration files for SQL scripts.

---

## Running the Application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

### Deploy to AWS ECR

```bash
npm run deploy
```

Server runs on `http://localhost:3000/api`

---

## API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `/auth/login`, `/auth/register`, `/auth/me` | JWT authentication |
| **Schools** | `/schools` | School management (CRUD) |
| **Users** | `/users` | Users management (admin & parents) |
| **Children** | `/children`, `/children/my-children` | Children management |
| **Devices** | `/devices`, `/devices/link` | Mobile device registration |
| **Tracking** | `/tracking/positions` (public) | GPS position tracking |
| **Alerts** | `/alerts`, `/alerts/my-alerts` | Geofence alerts |

---

## Project Structure

```
src/
├── auth/           # JWT authentication
├── schools/        # School management
├── users/          # User management
├── children/       # Children registration
├── devices/        # Device management
├── tracking/       # GPS tracking + geofence detection
├── alerts/         # Alert management
├── notifications/  # Firebase Cloud Messaging
├── firebase/       # Firebase Admin SDK config
├── prisma/         # Database service
└── common/
    ├── decorators/     # @Public, @CurrentUser
    ├── filters/        # HttpExceptionFilter
    ├── interceptors/   # ResponseInterceptor
    └── responses/      # ApiResponse helper
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/API_WEB_ADMIN.md](docs/API_WEB_ADMIN.md) | API reference for React admin panel |
| [docs/API_MOBILE_FLUTTER.md](docs/API_MOBILE_FLUTTER.md) | API reference for Flutter mobile app |
| [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) | API usage examples with curl/HTTP |
| [postman_collection.json](postman_collection.json) | Postman collection for testing |

---

## Tech Stack

- **Framework:** NestJS 11
- **ORM:** Prisma 6
- **Database:** PostgreSQL + PostGIS
- **Authentication:** JWT with Passport
- **Push Notifications:** Firebase Admin SDK
- **Validation:** class-validator
- **Language:** TypeScript 5

---

## License

MIT
