# 📡 API Endpoints - Guía de Uso

## 🏫 Schools (Colegios)

### Crear Colegio
```http
POST http://localhost:3000/api/schools
Content-Type: application/json

{
  "name": "Colegio San Martín",
  "address": "Av. Principal #123, Santa Cruz",
  "phone": "+591 3 1234567"
}
```

### Listar Colegios
```http
GET http://localhost:3000/api/schools
```

### Ver Colegio
```http
GET http://localhost:3000/api/schools/1
```

---

## 👥 Users (Usuarios)

### Crear Admin de Colegio
```http
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "schoolId": 1,
  "email": "admin@sanmartin.edu",
  "password": "admin123456",
  "fullName": "Juan Pérez Admin",
  "phone": "+591 70000001",
  "role": "SCHOOL_ADMIN"
}
```

### Crear Padre
```http
POST http://localhost:3000/api/users
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

### Listar Usuarios del Colegio
```http
GET http://localhost:3000/api/users
Authorization: Bearer {token}
```

### Filtrar solo Padres
```http
GET http://localhost:3000/api/users?role=PARENT
Authorization: Bearer {token}
```

---

## 🔐 Auth (Autenticación)

### Login
```http
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
    "fullName": "Juan Pérez Admin",
    "role": "SCHOOL_ADMIN",
    "schoolId": 1,
    "school": {
      "id": 1,
      "name": "Colegio San Martín"
    }
  }
}
```

### Ver Perfil
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer {token}
```

---

## 👶 Children (Hijos)

### Crear Hijo
```http
POST http://localhost:3000/api/children
Authorization: Bearer {token}
Content-Type: application/json

{
  "schoolId": 1,
  "parentId": 2,
  "fullName": "Pedrito González",
  "age": 8,
  "grade": "3ro Primaria"
}
```

### Listar Hijos del Colegio
```http
GET http://localhost:3000/api/children
Authorization: Bearer {token}
```

### Ver Hijos del Padre Logueado
```http
GET http://localhost:3000/api/children/my-children
Authorization: Bearer {token}
```

### Ver Detalle de Hijo
```http
GET http://localhost:3000/api/children/1
Authorization: Bearer {token}
```

---

## 📱 Devices (Dispositivos)

### Crear Dispositivo
```http
POST http://localhost:3000/api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "schoolId": 1,
  "deviceUid": "android-abc123-unique-id",
  "name": "Celular de Pedrito",
  "model": "Samsung Galaxy A13",
  "manufacturer": "Samsung",
  "osVersion": "Android 14",
  "platform": "android",
  "fcmToken": "fcm-token-here"
}
```

### Vincular Dispositivo con Hijo
```http
POST http://localhost:3000/api/devices/link
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceUid": "android-abc123-unique-id",
  "childId": 1
}
```

### Listar Dispositivos
```http
GET http://localhost:3000/api/devices
Authorization: Bearer {token}
```

---

## 📍 Tracking (Seguimiento GPS)

### Enviar Posición GPS (Público - desde app móvil)
```http
POST http://localhost:3000/api/tracking/positions
Content-Type: application/json

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
```

**Respuesta con detección automática:**
```json
{
  "position": {
    "id": 1,
    "childId": 1,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "heading": 90,
    "altitude": 420,
    "createdAt": "2025-11-23T..."
  },
  "isWithinArea": false,
  "alertCreated": true,
  "alert": {
    "id": 1,
    "type": "EXIT_AREA",
    "message": "¡ALERTA! Pedrito González ha salido del área segura del colegio",
    "isRead": false,
    "createdAt": "2025-11-23T..."
  }
}
```

### Ver Última Posición de un Hijo
```http
GET http://localhost:3000/api/tracking/child/1/last
Authorization: Bearer {token}
```

### Ver Historial de Posiciones
```http
GET http://localhost:3000/api/tracking/child/1/history?limit=20
Authorization: Bearer {token}
```

### Ver Todas las Posiciones del Colegio
```http
GET http://localhost:3000/api/tracking/school/all-positions
Authorization: Bearer {token}
```

---

## 🚨 Alerts (Alertas)

### Ver Todas las Alertas del Colegio
```http
GET http://localhost:3000/api/alerts
Authorization: Bearer {token}
```

### Ver Solo Alertas No Leídas
```http
GET http://localhost:3000/api/alerts?isRead=false
Authorization: Bearer {token}
```

### Ver Solo Alertas de Salida
```http
GET http://localhost:3000/api/alerts?type=EXIT_AREA
Authorization: Bearer {token}
```

### Ver Mis Alertas (Padre Logueado)
```http
GET http://localhost:3000/api/alerts/my-alerts
Authorization: Bearer {token}
```

### Contar Alertas No Leídas
```http
GET http://localhost:3000/api/alerts/unread-count
Authorization: Bearer {token}
```

### Marcar Alerta como Leída
```http
PATCH http://localhost:3000/api/alerts/1/mark-read
Authorization: Bearer {token}
```

### Marcar Todas como Leídas
```http
PATCH http://localhost:3000/api/alerts/mark-all-read
Authorization: Bearer {token}
```

---

## 🔧 Flujo Completo de Prueba

### 1. Crear Colegio
```bash
POST /api/schools
{
  "code": "TEST",
  "name": "Colegio Test",
  "address": "Dirección Test",
  "phone": "+591 3 1111111"
}
```

### 2. Crear Admin
```bash
POST /api/users
{
  "schoolId": 1,
  "email": "admin@test.com",
  "password": "admin123",
  "fullName": "Admin Test",
  "role": "SCHOOL_ADMIN"
}
```

### 3. Login como Admin
```bash
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}
# Guardar el token
```

### 4. Crear Padre
```bash
POST /api/users
Authorization: Bearer {token}
{
  "schoolId": 1,
  "email": "padre@test.com",
  "password": "padre123",
  "fullName": "Padre Test",
  "role": "PARENT"
}
```

### 5. Crear Hijo del Padre
```bash
POST /api/children
Authorization: Bearer {token}
{
  "schoolId": 1,
  "parentId": 2,
  "fullName": "Hijo Test",
  "grade": "3ro"
}
```

### 6. Crear Dispositivo y Vincularlo
```bash
POST /api/devices
{
  "schoolId": 1,
  "deviceId": "TEST-001",
  "deviceName": "Test Phone"
}

POST /api/devices/link
{
  "deviceId": "TEST-001",
  "childId": 1
}
```

### 7. Enviar Posición GPS
```bash
POST /api/tracking/positions
{
  "childId": 1,
  "lat": -17.783,
  "lng": -63.182
}
```

### 8. Ver Alertas Generadas
```bash
GET /api/alerts
Authorization: Bearer {token}
```

---

## 🗺️ Notas sobre PostGIS

- Las posiciones se guardan automáticamente con geometría POINT
- Se verifica automáticamente si está dentro del área del colegio usando `ST_Within`
- Para que funcione, el colegio debe tener su polígono `geom` definido en QGIS
- Las alertas se crean automáticamente al detectar cambios de estado (entrada/salida)

---

## 🎯 Endpoints Implementados

✅ **Auth**: Login, perfil  
✅ **Schools**: CRUD completo  
✅ **Users**: CRUD con multi-tenant  
✅ **Children**: CRUD con relación padre-hijo  
✅ **Devices**: Registro y vinculación  
✅ **Tracking**: Guardar posiciones con PostGIS, verificar ST_Within  
✅ **Alerts**: Gestión de alertas, marcar como leídas  

**Total: 7 módulos completos**
