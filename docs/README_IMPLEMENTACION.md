# 🎯 Backend NestJS - Sistema de Geofencing para Niños

## ✅ Estado Actual del Proyecto

### 1. Infraestructura Base
- ✅ NestJS inicializado
- ✅ Prisma 6 configurado
- ✅ PostgreSQL + PostGIS (RDS AWS)
- ✅ Migraciones aplicadas
- ✅ Columnas espaciales `geom` creadas

### 2. Módulos Implementados

#### 🔐 Auth Module
- ✅ Login con JWT
- ✅ JwtStrategy con Passport
- ✅ Guards (JwtAuthGuard, RolesGuard)
- ✅ Decoradores (@CurrentUser, @Roles, @Public)
- ✅ Endpoints:
  - `POST /api/auth/login`
  - `GET /api/auth/me`

#### 🏫 Schools Module
- ✅ CRUD completo
- ✅ Endpoints:
  - `POST /api/schools` - Crear colegio (público)
  - `GET /api/schools` - Listar todos (público)
  - `GET /api/schools/:id` - Ver detalle (público)
  - `PATCH /api/schools/:id` - Actualizar
  - `DELETE /api/schools/:id` - Eliminar

#### 👥 Users Module
- ✅ CRUD con multi-tenant
- ✅ Roles: SCHOOL_ADMIN, PARENT
- ✅ Hash de contraseñas con bcrypt
- ✅ Endpoints:
  - `POST /api/users` - Crear usuario (público para registro inicial)
  - `GET /api/users` - Listar por colegio (protegido)
  - `GET /api/users/:id` - Ver perfil (protegido)
  - `PATCH /api/users/:id` - Actualizar (protegido)
  - `DELETE /api/users/:id` - Eliminar (protegido)

### 3. Módulos Pendientes (Esqueleto creado)

#### 👶 Children Module
**Funcionalidad**: Gestión de hijos asociados a padres
- DTOs por crear
- CRUD básico
- Relación con User (padre) y School

#### 📱 Devices Module
**Funcionalidad**: Emparejar dispositivos móviles con niños
- Registro de deviceId
- FCM tokens para notificaciones push
- Asociación con Child

#### 📍 Tracking Module  
**Funcionalidad**: Recibir y procesar ubicaciones GPS
- `POST /api/tracking/positions`
- Guardar lat/lng + crear `geom` con PostGIS
- Verificar ST_Within (dentro/fuera del área)
- Disparar alertas automáticas

#### 🚨 Alerts Module
**Funcionalidad**: Gestión de alertas de entrada/salida
- Listar alertas del padre logueado
- Marcar como leídas
- Tipos: EXIT_AREA, ENTER_AREA
- Integración con FCM (opcional)

---

## 📋 Cómo Crear un Colegio y Usuarios

### Paso 1: Crear un Colegio
```bash
POST http://localhost:3000/api/schools
Content-Type: application/json

{
  "code": "SANMARTIN",
  "name": "Colegio San Martín",
  "address": "Av. Principal #123, Santa Cruz",
  "phone": "+591 3 1234567"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "code": "SANMARTIN",
  "name": "Colegio San Martín",
  "address": "Av. Principal #123, Santa Cruz",
  "phone": "+591 3 1234567",
  "status": "ACTIVE",
  "createdAt": "2025-11-23T...",
  "updatedAt": "2025-11-23T..."
}
```

### Paso 2: Crear un Admin del Colegio
```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "schoolId": 1,
  "email": "admin@sanmartin.edu",
  "password": "admin123456",
  "fullName": "Juan Pérez",
  "phone": "+591 70000001",
  "role": "SCHOOL_ADMIN"
}
```

### Paso 3: Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@sanmartin.edu",
  "password": "admin123456"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@sanmartin.edu",
    "fullName": "Juan Pérez",
    "role": "SCHOOL_ADMIN",
    "schoolId": 1,
    "school": {
      "id": 1,
      "code": "SANMARTIN",
      "name": "Colegio San Martín"
    }
  }
}
```

### Paso 4: Crear un Padre (como Admin)
```bash
POST http://localhost:3000/api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "schoolId": 1,
  "email": "padre@example.com",
  "password": "padre123",
  "fullName": "María González",
  "phone": "+591 70000002",
  "role": "PARENT"
}
```

---

## 🔧 Variables de Entorno (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@dbvpay.cfiek6gqkqd5.us-east-1.rds.amazonaws.com:5432/vpayDB?schema=sig"

# JWT
JWT_SECRET="uagrm123"
JWT_EXPIRATION="7d"

# App
PORT=3000
NODE_ENV="development"

# FCM (opcional)
FCM_SERVER_KEY="your-fcm-server-key"
```

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Prisma
npx prisma studio              # Abrir UI de datos
npx prisma generate            # Regenerar cliente
npx prisma migrate dev         # Nueva migración
npm run prisma:seed            # Ejecutar seed (opcional)

# Build
npm run build
npm run start:prod
```

---

## 📊 Diagrama de Flujo Multi-Tenant

```
School (tenant)
  └── Users (ADMIN, PARENT)
       └── Children
            └── Devices
                 └── ChildPositions (con geom POINT)
                      └── Alerts (EXIT_AREA / ENTER_AREA)
```

**Regla:** Todo se filtra por `schoolId` automáticamente en los guards.

---

## 🗺️ PostGIS - Verificación de Áreas

### Query ejemplo para verificar si un punto está dentro del área:
```sql
SELECT 
  cp.id,
  cp.child_id,
  ST_Within(
    cp.geom,
    s.geom
  ) as dentro_del_colegio
FROM sig.child_positions cp
JOIN sig.schools s ON s.id = cp.school_id
WHERE cp.child_id = 1
ORDER BY cp.created_at DESC
LIMIT 10;
```

---

## 📝 Próximos Pasos

1. ✅ Implementar Children, Devices, Tracking, Alerts
2. ⚠️ Agregar guard global JWT
3. ⚠️ Implementar lógica ST_Within en Tracking
4. ⚠️ Integración FCM para notificaciones push
5. ⚠️ Tests unitarios
6. ⚠️ Documentación Swagger/OpenAPI

---

**Servidor corriendo en:** `http://localhost:3000/api`
