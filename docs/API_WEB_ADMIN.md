# 🖥️ API Reference - Panel Web Admin (React)

**Base URL:** `http://localhost:3000/api`

**Versión:** 1.0.1 | **Última actualización:** 27 Nov 2025

---

## 🔐 Autenticación

Todos los endpoints requieren JWT (excepto login):

```javascript
// Axios config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📦 Formato de Respuesta

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
  code?: string;      // Solo en errores
  details?: string[]; // Solo en errores de validación
}
```

---

## 1️⃣ Autenticación y Contexto

### `POST /auth/login`
Admin inicia sesión y recibe JWT con schoolId.

```javascript
// Request
const response = await api.post('/auth/login', {
  email: 'admin@colegio.edu',
  password: 'admin123'
});

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@colegio.edu",
      "fullName": "Juan Admin",
      "role": "SCHOOL_ADMIN",
      "schoolId": 1,
      "school": {
        "id": 1,
        "name": "Colegio Boliviano Americano"
      }
    }
  }
}

// Guardar token
localStorage.setItem('accessToken', response.data.data.accessToken);
localStorage.setItem('user', JSON.stringify(response.data.data.user));
```

---

### `GET /auth/me`
Obtener datos del usuario logueado (para validar sesión).

```javascript
const response = await api.get('/auth/me');

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "email": "admin@colegio.edu",
    "fullName": "Juan Admin",
    "role": "SCHOOL_ADMIN",
    "schoolId": 1,
    "status": "ACTIVE"
  }
}
```

---

## 2️⃣ Gestión de Padres/Tutores

> **Nota:** Usa el endpoint `/users` con `role=PARENT`

### `GET /users?role=PARENT`
Lista de padres del colegio (filtrado automático por schoolId del token).

```javascript
const response = await api.get('/users', {
  params: { role: 'PARENT' }
});

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 2,
      "email": "padre@gmail.com",
      "fullName": "María García",
      "phone": "+591 77123456",
      "role": "PARENT",
      "status": "ACTIVE",
      "schoolId": 1,
      "createdAt": "2025-11-26T10:00:00.000Z"
    }
  ]
}
```

---

### `POST /users`
Crear nuevo padre.

```javascript
const response = await api.post('/users', {
  email: 'nuevopadre@gmail.com',
  password: 'temporal123',
  fullName: 'Carlos López',
  phone: '+591 70000000',
  role: 'PARENT'
  // schoolId se obtiene del token automáticamente
});

// Response: 201 Created
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 3,
    "email": "nuevopadre@gmail.com",
    "fullName": "Carlos López",
    "phone": "+591 70000000",
    "role": "PARENT",
    "status": "ACTIVE",
    "schoolId": 1
  }
}
```

---

### `PATCH /users/:id`
Editar datos del padre.

```javascript
const response = await api.patch('/users/2', {
  fullName: 'María García de López',
  phone: '+591 77999999'
});

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 2,
    "fullName": "María García de López",
    "phone": "+591 77999999"
  }
}
```

---

### `DELETE /users/:id`
Eliminar/desactivar padre.

```javascript
const response = await api.delete('/users/2');

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 2,
    "email": "padre@gmail.com"
  }
}
```

---

## 3️⃣ Gestión de Hijos/Alumnos

### `GET /children`
Lista de hijos del colegio (con padre asociado).

```javascript
const response = await api.get('/children');

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "fullName": "Pedrito García",
      "age": 8,
      "grade": "3ro Primaria",
      "status": "ACTIVE",
      "parentId": 2,
      "parent": {
        "id": 2,
        "fullName": "María García",
        "email": "padre@gmail.com",
        "phone": "+591 77123456"
      },
      "devices": [
        {
          "id": 1,
          "name": "Samsung A13",
          "lastBatteryLevel": 85,
          "lastSeen": "2025-11-27T12:30:00.000Z"
        }
      ]
    }
  ]
}
```

---

### `GET /children?parentId=2`
Filtrar hijos por padre específico.

```javascript
const response = await api.get('/children', {
  params: { parentId: 2 }
});
```

---

### `POST /children`
Crear hijo y asociarlo a un padre.

```javascript
const response = await api.post('/children', {
  parentId: 2,
  fullName: 'Ana García',
  age: 10,
  grade: '5to Primaria'
  // schoolId se obtiene del token automáticamente
});

// Response: 201 Created
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 2,
    "fullName": "Ana García",
    "age": 10,
    "grade": "5to Primaria",
    "status": "ACTIVE",
    "parentId": 2,
    "schoolId": 1
  }
}
```

---

### `PATCH /children/:id`
Editar datos del hijo.

```javascript
const response = await api.patch('/children/1', {
  age: 9,
  grade: '4to Primaria'
});

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "fullName": "Pedrito García",
    "age": 9,
    "grade": "4to Primaria"
  }
}
```

---

### `DELETE /children/:id`
Eliminar/desactivar hijo.

```javascript
const response = await api.delete('/children/1');
```

---

## 4️⃣ Gestión de Dispositivos

### `GET /devices`
Lista de dispositivos del colegio.

```javascript
const response = await api.get('/devices');

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "deviceUid": "android-abc123",
      "name": "Samsung A13",
      "model": "SM-A135F",
      "manufacturer": "Samsung",
      "platform": "android",
      "lastBatteryLevel": 85,
      "lastSeen": "2025-11-27T12:30:00.000Z",
      "status": "ACTIVE",
      "childId": 1,
      "child": {
        "id": 1,
        "fullName": "Pedrito García"
      }
    }
  ]
}
```

---

### `POST /devices`
Registrar nuevo dispositivo.

```javascript
const response = await api.post('/devices', {
  deviceUid: 'android-xyz789',
  name: 'Xiaomi Redmi',
  model: 'Redmi Note 12',
  manufacturer: 'Xiaomi',
  osVersion: 'Android 13',
  platform: 'android'
});
```

---

### `POST /devices/link`
Vincular dispositivo a un hijo.

```javascript
const response = await api.post('/devices/link', {
  deviceUid: 'android-abc123',
  childId: 1
});

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "deviceUid": "android-abc123",
    "childId": 1,
    "child": {
      "id": 1,
      "fullName": "Pedrito García"
    }
  }
}
```

---

## 5️⃣ Monitoreo en Mapa (Dashboard)

### `GET /tracking/current`
**⭐ ENDPOINT PRINCIPAL PARA EL MAPA**

Devuelve todas las últimas posiciones de todos los niños del colegio.

```javascript
const response = await api.get('/tracking/current');

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 123,
      "childId": 1,
      "lat": -17.783,
      "lng": -63.182,
      "accuracy": 10.5,
      "speed": 0,
      "batteryLevel": 85,
      "createdAt": "2025-11-27T12:30:00.000Z",
      "child": {
        "id": 1,
        "fullName": "Pedrito García",
        "grade": "3ro Primaria"
      }
    },
    {
      "id": 124,
      "childId": 2,
      "lat": -17.784,
      "lng": -63.183,
      "accuracy": 8.0,
      "speed": 2.5,
      "batteryLevel": 72,
      "createdAt": "2025-11-27T12:28:00.000Z",
      "child": {
        "id": 2,
        "fullName": "Ana García",
        "grade": "5to Primaria"
      }
    }
  ]
}
```

**Uso en React con Leaflet/Google Maps:**
```javascript
// Dashboard.jsx
const [positions, setPositions] = useState([]);

useEffect(() => {
  const fetchPositions = async () => {
    const response = await api.get('/tracking/current');
    if (response.data.success) {
      setPositions(response.data.data);
    }
  };
  
  fetchPositions();
  // Polling cada 30 segundos
  const interval = setInterval(fetchPositions, 30000);
  return () => clearInterval(interval);
}, []);
```

---

### `GET /tracking/child/:childId/last`
Última posición de un niño específico (vista detalle).

```javascript
const response = await api.get('/tracking/child/1/last');

// Response
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 123,
    "childId": 1,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "heading": 90,
    "altitude": 420,
    "batteryLevel": 85,
    "createdAt": "2025-11-27T12:30:00.000Z"
  }
}
```

---

### `GET /tracking/child/:childId/history`
Historial de posiciones para graficar trayecto.

```javascript
const response = await api.get('/tracking/child/1/history', {
  params: { 
    limit: 100,
    from: '2025-11-27T00:00:00.000Z',
    to: '2025-11-27T23:59:59.000Z'
  }
});

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    { "id": 123, "lat": -17.783, "lng": -63.182, "createdAt": "2025-11-27T12:30:00.000Z" },
    { "id": 122, "lat": -17.784, "lng": -63.183, "createdAt": "2025-11-27T12:25:00.000Z" },
    // ...más posiciones
  ]
}
```

---

## 6️⃣ Alertas (Panel Admin)

### `GET /alerts`
Lista de alertas recientes de todos los niños del colegio.

```javascript
const response = await api.get('/alerts', {
  params: { 
    isRead: false  // Solo no leídas
  }
});

// Response
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "type": "EXIT_AREA",
      "message": "Pedrito García ha salido del área segura del colegio",
      "isRead": false,
      "createdAt": "2025-11-27T12:25:00.000Z",
      "child": {
        "id": 1,
        "fullName": "Pedrito García"
      },
      "position": {
        "lat": -17.790,
        "lng": -63.190
      }
    }
  ]
}
```

---

### `PATCH /alerts/:id/mark-read`
Marcar alerta como leída.

```javascript
await api.patch('/alerts/1/mark-read');
```

---

### `PATCH /alerts/mark-all-read`
Marcar todas las alertas como leídas.

```javascript
await api.patch('/alerts/mark-all-read');
```

---

## 📊 Resumen de Endpoints para Admin

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/auth/login` | POST | Login |
| `/auth/me` | GET | Validar sesión |
| `/users?role=PARENT` | GET | Listar padres |
| `/users` | POST | Crear padre |
| `/users/:id` | PATCH | Editar padre |
| `/users/:id` | DELETE | Eliminar padre |
| `/children` | GET | Listar hijos |
| `/children` | POST | Crear hijo |
| `/children/:id` | PATCH | Editar hijo |
| `/children/:id` | DELETE | Eliminar hijo |
| `/devices` | GET | Listar dispositivos |
| `/devices/link` | POST | Vincular dispositivo |
| `/tracking/current` | GET | **Mapa: todas las posiciones** |
| `/tracking/child/:id/last` | GET | Posición de un hijo |
| `/tracking/child/:id/history` | GET | Historial de un hijo |
| `/alerts` | GET | Listar alertas |
| `/alerts/:id/mark-read` | PATCH | Marcar leída |

---

## 🎨 Ejemplo de Estructura React

```
src/
├── api/
│   └── index.js          # Configuración Axios
├── context/
│   └── AuthContext.jsx   # Contexto de autenticación
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx     # Mapa con /tracking/current
│   ├── Parents.jsx       # CRUD padres
│   ├── Children.jsx      # CRUD hijos
│   ├── Devices.jsx       # Gestión dispositivos
│   └── Alerts.jsx        # Panel de alertas
└── components/
    ├── Map.jsx           # Componente mapa
    └── DataTable.jsx     # Tabla reutilizable
```
