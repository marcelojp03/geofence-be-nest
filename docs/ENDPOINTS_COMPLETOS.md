# 🔌 Endpoints del Backend - Guía de Integración

Referencia completa de los 53 endpoints disponibles en el backend de geofencing, organizados por cliente consumidor.

---

## 📱 Endpoints para App Móvil (Padres)

### 🔐 Autenticación

#### Login
```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "padre@gmail.com",
  "password": "padre123"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "padre@gmail.com",
    "fullName": "María García",
    "role": "PARENT",
    "schoolId": 1
  }
}
```

#### Ver Perfil
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 2,
  "email": "padre@gmail.com",
  "fullName": "María García",
  "role": "PARENT",
  "schoolId": 1,
  "school": {
    "id": 1,
    "name": "Colegio San Martín"
  }
}
```

---

### 👶 Hijos del Padre

#### Listar Mis Hijos
```http
GET /api/children/my-children
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "fullName": "Pedrito García",
    "age": 8,
    "grade": "3ro Primaria",
    "status": "ACTIVE",
    "schoolId": 1,
    "parentId": 2
  }
]
```

#### Ver Detalle de un Hijo
```http
GET /api/children/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "fullName": "Pedrito García",
  "age": 8,
  "grade": "3ro Primaria",
  "status": "ACTIVE",
  "school": {
    "id": 1,
    "name": "Colegio San Martín"
  },
  "parent": {
    "id": 2,
    "fullName": "María García",
    "email": "padre@gmail.com"
  },
  "devices": [
    {
      "id": 1,
      "name": "Celular de Pedrito",
      "model": "Samsung Galaxy A13",
      "lastBatteryLevel": 85,
      "lastSeen": "2025-11-24T12:30:00Z"
    }
  ]
}
```

---

### 📍 Tracking GPS

#### Ver Última Posición del Hijo
```http
GET /api/tracking/child/:childId/last
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 123,
  "childId": 1,
  "lat": -17.783,
  "lng": -63.182,
  "accuracy": 10.5,
  "speed": 0,
  "batteryLevel": 85,
  "createdAt": "2025-11-24T12:29:45Z"
}
```

#### Ver Historial de Posiciones
```http
GET /api/tracking/child/:childId/history?limit=20&from=2025-11-24T00:00:00Z
Authorization: Bearer {token}

Query params:
- limit: número de registros (default: 50, max: 100)
- from: fecha inicio (ISO 8601)
- to: fecha fin (ISO 8601)

Response: 200 OK
[
  {
    "id": 123,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "batteryLevel": 85,
    "createdAt": "2025-11-24T12:29:45Z"
  },
  {
    "id": 122,
    "lat": -17.784,
    "lng": -63.183,
    "accuracy": 12.0,
    "speed": 5.5,
    "batteryLevel": 86,
    "createdAt": "2025-11-24T12:14:30Z"
  }
]
```

---

### 🚨 Alertas

#### Ver Mis Alertas (del padre logueado)
```http
GET /api/alerts/my-alerts?isRead=false
Authorization: Bearer {token}

Query params:
- isRead: true/false (filtrar por estado)

Response: 200 OK
[
  {
    "id": 1,
    "type": "EXIT_AREA",
    "message": "Pedrito García ha salido del área segura del colegio",
    "isRead": false,
    "createdAt": "2025-11-24T12:25:00Z",
    "child": {
      "id": 1,
      "fullName": "Pedrito García"
    },
    "position": {
      "lat": -17.783,
      "lng": -63.182
    }
  }
]
```

#### Contar Alertas No Leídas
```http
GET /api/alerts/unread-count
Authorization: Bearer {token}

Response: 200 OK
{
  "count": 3
}
```

#### Marcar Alerta como Leída
```http
PATCH /api/alerts/:id/mark-read
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "isRead": true,
  "readAt": "2025-11-24T12:35:00Z"
}
```

#### Marcar Todas las Alertas como Leídas
```http
PATCH /api/alerts/mark-all-read
Authorization: Bearer {token}

Response: 200 OK
{
  "updatedCount": 3
}
```

---

## 📱 Endpoints para App de Tracking (Hijo)

### 📱 Registro Inicial del Dispositivo

#### Crear Dispositivo (Primera instalación)
```http
POST /api/devices
Authorization: Bearer {token}  // Token del admin o padre
Content-Type: application/json

Body:
{
  "schoolId": 1,
  "deviceUid": "android-abc123-unique-id",
  "name": "Celular de Pedrito",
  "model": "Samsung Galaxy A13",
  "manufacturer": "Samsung",
  "osVersion": "Android 14",
  "platform": "android",
  "fcmToken": "fcm-token-from-firebase"
}

Response: 201 Created
{
  "id": 1,
  "deviceUid": "android-abc123-unique-id",
  "name": "Celular de Pedrito",
  "model": "Samsung Galaxy A13",
  "manufacturer": "Samsung",
  "osVersion": "Android 14",
  "platform": "android",
  "schoolId": 1,
  "childId": null,
  "status": "ACTIVE",
  "createdAt": "2025-11-24T10:00:00Z"
}
```

#### Vincular Dispositivo a Hijo
```http
POST /api/devices/link
Authorization: Bearer {token}  // Token del admin o padre
Content-Type: application/json

Body:
{
  "deviceUid": "android-abc123-unique-id",
  "childId": 1
}

Response: 200 OK
{
  "id": 1,
  "deviceUid": "android-abc123-unique-id",
  "childId": 1,
  "child": {
    "id": 1,
    "fullName": "Pedrito García",
    "grade": "3ro Primaria"
  }
}
```

---

### 📍 Envío de Posiciones GPS (CRÍTICO)

#### Enviar Posición (SIN Autenticación - Público)
```http
POST /api/tracking/positions
Content-Type: application/json

Body:
{
  "deviceUid": "android-abc123-unique-id",
  "lat": -17.783,
  "lng": -63.182,
  "accuracy": 10.5,
  "speed": 0,
  "heading": 90,
  "altitude": 420,
  "batteryLevel": 85
}

Response: 201 Created
{
  "position": {
    "id": 123,
    "childId": 1,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "heading": 90,
    "altitude": 420,
    "batteryLevel": 85,
    "createdAt": "2025-11-24T12:29:45Z"
  },
  "isWithinArea": false,
  "alertCreated": true,
  "alert": {
    "id": 1,
    "type": "EXIT_AREA",
    "message": "Pedrito García ha salido del área segura del colegio",
    "isRead": false,
    "createdAt": "2025-11-24T12:29:45Z"
  }
}

Errores posibles:
404 Not Found - Dispositivo no encontrado o no vinculado
{
  "statusCode": 404,
  "message": "Dispositivo no encontrado o no vinculado a un hijo"
}
```

**Nota importante**: Este endpoint es **público** (sin JWT). Solo necesita el `deviceUid` para identificar el dispositivo y resolver el hijo asociado.

---

## 🌐 Endpoints para Panel Web (Admin)

### 🔐 Autenticación

#### Login de Admin
```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@sanmartin.edu",
  "password": "admin123"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@sanmartin.edu",
    "fullName": "Juan Pérez",
    "role": "SCHOOL_ADMIN",
    "schoolId": 1
  }
}
```

---

### 🏫 Gestión de Colegios

#### Crear Colegio
```http
POST /api/schools
Content-Type: application/json

Body:
{
  "name": "Colegio San Martín",
  "address": "Av. Principal 123",
  "phone": "+591 3 1234567"
}

Response: 201 Created
{
  "id": 1,
  "name": "Colegio San Martín",
  "address": "Av. Principal 123",
  "phone": "+591 3 1234567",
  "status": "ACTIVE",
  "createdAt": "2025-11-24T10:00:00Z"
}
```

#### Listar Colegios
```http
GET /api/schools

Response: 200 OK
[
  {
    "id": 1,
    "name": "Colegio San Martín",
    "address": "Av. Principal 123",
    "phone": "+591 3 1234567",
    "status": "ACTIVE",
    "_count": {
      "users": 15,
      "children": 50
    }
  }
]
```

#### Ver Colegio
```http
GET /api/schools/:id

Response: 200 OK
{
  "id": 1,
  "name": "Colegio San Martín",
  "address": "Av. Principal 123",
  "phone": "+591 3 1234567",
  "status": "ACTIVE",
  "users": [
    {
      "id": 1,
      "fullName": "Juan Pérez",
      "email": "admin@sanmartin.edu",
      "role": "SCHOOL_ADMIN"
    }
  ],
  "_count": {
    "children": 50,
    "devices": 45
  }
}
```

#### Actualizar Colegio
```http
PATCH /api/schools/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "Colegio San Martín de Porres",
  "phone": "+591 3 9999999"
}

Response: 200 OK
{
  "id": 1,
  "name": "Colegio San Martín de Porres",
  "phone": "+591 3 9999999"
}
```

#### Eliminar Colegio
```http
DELETE /api/schools/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "name": "Colegio San Martín"
}
```

---

### 👥 Gestión de Usuarios

#### Crear Usuario (Admin o Padre)
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

Body para Admin:
{
  "schoolId": 1,
  "email": "admin2@sanmartin.edu",
  "password": "admin123",
  "fullName": "Pedro López",
  "phone": "+591 70000002",
  "role": "SCHOOL_ADMIN"
}

Body para Padre:
{
  "schoolId": 1,
  "email": "padre@gmail.com",
  "password": "padre123",
  "fullName": "María García",
  "phone": "+591 77123456",
  "role": "PARENT"
}

Response: 201 Created
{
  "id": 2,
  "email": "padre@gmail.com",
  "fullName": "María García",
  "phone": "+591 77123456",
  "role": "PARENT",
  "schoolId": 1,
  "status": "ACTIVE"
}
```

#### Listar Usuarios
```http
GET /api/users?role=PARENT
Authorization: Bearer {token}

Query params:
- role: SCHOOL_ADMIN | PARENT (filtrar por rol)

Response: 200 OK
[
  {
    "id": 2,
    "email": "padre@gmail.com",
    "fullName": "María García",
    "role": "PARENT",
    "status": "ACTIVE",
    "schoolId": 1
  }
]
```

#### Ver Usuario
```http
GET /api/users/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 2,
  "email": "padre@gmail.com",
  "fullName": "María García",
  "phone": "+591 77123456",
  "role": "PARENT",
  "status": "ACTIVE",
  "schoolId": 1,
  "children": [
    {
      "id": 1,
      "fullName": "Pedrito García"
    }
  ]
}
```

#### Actualizar Usuario
```http
PATCH /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "fullName": "María García de González",
  "phone": "+591 77999999"
}

Response: 200 OK
{
  "id": 2,
  "fullName": "María García de González",
  "phone": "+591 77999999"
}
```

#### Eliminar Usuario
```http
DELETE /api/users/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 2,
  "fullName": "María García"
}
```

---

### 👶 Gestión de Hijos

#### Crear Hijo
```http
POST /api/children
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "schoolId": 1,
  "parentId": 2,
  "fullName": "Pedrito García",
  "age": 8,
  "grade": "3ro Primaria"
}

Response: 201 Created
{
  "id": 1,
  "fullName": "Pedrito García",
  "age": 8,
  "grade": "3ro Primaria",
  "schoolId": 1,
  "parentId": 2,
  "status": "ACTIVE"
}
```

#### Listar Hijos del Colegio
```http
GET /api/children
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "fullName": "Pedrito García",
    "age": 8,
    "grade": "3ro Primaria",
    "status": "ACTIVE",
    "parent": {
      "id": 2,
      "fullName": "María García"
    }
  }
]
```

#### Ver Hijo
```http
GET /api/children/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "fullName": "Pedrito García",
  "age": 8,
  "grade": "3ro Primaria",
  "status": "ACTIVE",
  "school": {
    "id": 1,
    "name": "Colegio San Martín"
  },
  "parent": {
    "id": 2,
    "fullName": "María García",
    "email": "padre@gmail.com",
    "phone": "+591 77123456"
  }
}
```

#### Actualizar Hijo
```http
PATCH /api/children/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "age": 9,
  "grade": "4to Primaria"
}

Response: 200 OK
{
  "id": 1,
  "fullName": "Pedrito García",
  "age": 9,
  "grade": "4to Primaria"
}
```

#### Eliminar Hijo
```http
DELETE /api/children/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "fullName": "Pedrito García"
}
```

---

### 📱 Gestión de Dispositivos

#### Crear Dispositivo
```http
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "schoolId": 1,
  "deviceUid": "android-xyz789",
  "name": "Celular de Ana",
  "model": "Xiaomi Redmi Note 12",
  "manufacturer": "Xiaomi",
  "osVersion": "Android 13",
  "platform": "android",
  "fcmToken": "fcm-token-here"
}

Response: 201 Created
{
  "id": 2,
  "deviceUid": "android-xyz789",
  "name": "Celular de Ana",
  "model": "Xiaomi Redmi Note 12",
  "manufacturer": "Xiaomi",
  "osVersion": "Android 13",
  "platform": "android",
  "schoolId": 1,
  "childId": null,
  "status": "ACTIVE"
}
```

#### Listar Dispositivos
```http
GET /api/devices
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "deviceUid": "android-abc123",
    "name": "Celular de Pedrito",
    "model": "Samsung Galaxy A13",
    "lastBatteryLevel": 85,
    "lastSeen": "2025-11-24T12:30:00Z",
    "status": "ACTIVE",
    "child": {
      "id": 1,
      "fullName": "Pedrito García",
      "grade": "3ro Primaria"
    }
  }
]
```

#### Ver Dispositivo
```http
GET /api/devices/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "deviceUid": "android-abc123",
  "name": "Celular de Pedrito",
  "model": "Samsung Galaxy A13",
  "manufacturer": "Samsung",
  "osVersion": "Android 14",
  "platform": "android",
  "lastBatteryLevel": 85,
  "lastSeen": "2025-11-24T12:30:00Z",
  "status": "ACTIVE",
  "child": {
    "id": 1,
    "fullName": "Pedrito García",
    "parent": {
      "id": 2,
      "fullName": "María García",
      "email": "padre@gmail.com"
    }
  }
}
```

#### Actualizar Dispositivo
```http
PATCH /api/devices/:id
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "Celular Principal de Pedrito",
  "fcmToken": "new-fcm-token"
}

Response: 200 OK
{
  "id": 1,
  "name": "Celular Principal de Pedrito",
  "fcmToken": "new-fcm-token"
}
```

#### Eliminar Dispositivo
```http
DELETE /api/devices/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "deviceUid": "android-abc123"
}
```

#### Vincular Dispositivo a Hijo
```http
POST /api/devices/link
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "deviceUid": "android-abc123",
  "childId": 1
}

Response: 200 OK
{
  "id": 1,
  "deviceUid": "android-abc123",
  "childId": 1,
  "child": {
    "id": 1,
    "fullName": "Pedrito García",
    "grade": "3ro Primaria"
  }
}
```

---

### 📍 Monitoreo de Tracking (Vista Global)

#### Ver Todas las Posiciones Recientes del Colegio
```http
GET /api/tracking/school/all-positions
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 123,
    "childId": 1,
    "lat": -17.783,
    "lng": -63.182,
    "batteryLevel": 85,
    "createdAt": "2025-11-24T12:29:45Z",
    "child": {
      "id": 1,
      "fullName": "Pedrito García"
    }
  },
  {
    "id": 124,
    "childId": 2,
    "lat": -17.784,
    "lng": -63.183,
    "batteryLevel": 72,
    "createdAt": "2025-11-24T12:28:30Z",
    "child": {
      "id": 2,
      "fullName": "Ana López"
    }
  }
]
```

#### Ver Última Posición de un Hijo Específico
```http
GET /api/tracking/child/:childId/last
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 123,
  "childId": 1,
  "lat": -17.783,
  "lng": -63.182,
  "accuracy": 10.5,
  "speed": 0,
  "batteryLevel": 85,
  "createdAt": "2025-11-24T12:29:45Z"
}
```

#### Ver Historial de un Hijo
```http
GET /api/tracking/child/:childId/history?limit=100&from=2025-11-24T00:00:00Z&to=2025-11-24T23:59:59Z
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 123,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "batteryLevel": 85,
    "createdAt": "2025-11-24T12:29:45Z"
  }
]
```

---

### 🚨 Gestión de Alertas (Vista Global)

#### Ver Todas las Alertas del Colegio
```http
GET /api/alerts?type=EXIT_AREA&isRead=false
Authorization: Bearer {token}

Query params:
- type: ENTER_AREA | EXIT_AREA
- isRead: true | false

Response: 200 OK
[
  {
    "id": 1,
    "type": "EXIT_AREA",
    "message": "Pedrito García ha salido del área segura del colegio",
    "isRead": false,
    "createdAt": "2025-11-24T12:25:00Z",
    "child": {
      "id": 1,
      "fullName": "Pedrito García",
      "parent": {
        "id": 2,
        "fullName": "María García"
      }
    },
    "position": {
      "lat": -17.783,
      "lng": -63.182
    }
  }
]
```

#### Ver Alerta Específica
```http
GET /api/alerts/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "type": "EXIT_AREA",
  "message": "Pedrito García ha salido del área segura del colegio",
  "isRead": false,
  "createdAt": "2025-11-24T12:25:00Z",
  "readAt": null,
  "child": {
    "id": 1,
    "fullName": "Pedrito García"
  },
  "position": {
    "id": 123,
    "lat": -17.783,
    "lng": -63.182,
    "batteryLevel": 85
  }
}
```

#### Marcar Alerta como Leída
```http
PATCH /api/alerts/:id/mark-read
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "isRead": true,
  "readAt": "2025-11-24T12:35:00Z"
}
```

---

## 📊 Resumen de Endpoints por Cliente

### 📱 App Móvil (Padres) - 10 endpoints
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Ver perfil |
| GET | `/api/children/my-children` | Mis hijos |
| GET | `/api/children/:id` | Detalle hijo |
| GET | `/api/tracking/child/:id/last` | Última ubicación |
| GET | `/api/tracking/child/:id/history` | Historial GPS |
| GET | `/api/alerts/my-alerts` | Mis alertas |
| GET | `/api/alerts/unread-count` | Contador |
| PATCH | `/api/alerts/:id/mark-read` | Marcar leída |
| PATCH | `/api/alerts/mark-all-read` | Marcar todas |

### 📱 App Tracking (Hijo) - 2 endpoints
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/devices` | Registro inicial ⚠️ Con auth |
| POST | `/api/tracking/positions` | Envío GPS ✅ Sin auth |

### 🌐 Panel Admin - 31 endpoints
| Módulo | Endpoints | Operaciones |
|--------|-----------|-------------|
| Auth | 2 | Login, perfil |
| Schools | 5 | CRUD completo |
| Users | 5 | CRUD completo |
| Children | 5 | CRUD completo |
| Devices | 6 | CRUD + link |
| Tracking | 3 | Monitoreo global |
| Alerts | 3 | Vista global |

---

## 🔒 Autenticación y Seguridad

### Headers Requeridos

#### Con JWT (App Padre + Panel Admin)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Sin JWT (App Tracking)
```http
Content-Type: application/json
```

### Códigos de Estado HTTP

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | Token inválido/expirado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email/deviceUid duplicado |
| 500 | Internal Error | Error del servidor |

### Estructura de Errores

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

```json
{
  "statusCode": 409,
  "message": "El dispositivo ya está registrado"
}
```

---

## 🎯 Casos de Uso por Cliente

### App Móvil (Padre)
1. Login → obtener token
2. Listar mis hijos
3. Por cada hijo:
   - Ver última posición
   - Mostrar en mapa
   - Ver batería del dispositivo
4. Polling cada 30s para actualizar posiciones
5. Ver alertas no leídas
6. Marcar alertas como leídas

### App Tracking (Hijo)
1. Primera instalación:
   - Padre/Admin registra device con `/api/devices`
   - Padre/Admin vincula con `/api/devices/link`
2. Background service cada 5 minutos:
   - Obtener GPS + batería
   - POST a `/api/tracking/positions`
3. Sin UI (servicio transparente)

### Panel Admin
1. Login → obtener token
2. Dashboard:
   - Ver todas las posiciones en mapa
   - Ver alertas recientes
   - Estadísticas
3. CRUD completo:
   - Usuarios (admins y padres)
   - Hijos
   - Dispositivos
4. Monitoreo en tiempo real
5. Gestión de alertas

---

## 📝 Notas Técnicas

### Base URL
```
http://localhost:3000/api
```

### Formato de Fechas
Todas las fechas usan formato ISO 8601:
```
2025-11-24T12:29:45Z
```

### Paginación
Actualmente no implementada. Se recomienda usar `limit` en historial.

### Rate Limiting
No implementado actualmente.

### CORS
Configurado para permitir todos los orígenes en desarrollo.

### WebSockets
No implementados. Se recomienda polling para actualizaciones en tiempo real.
