# 🏗️ Arquitectura de Clientes - División de Responsabilidades

## 📱 App Móvil Flutter (Padres)

### 🎯 Propósito
Aplicación para **padres** que permite:
- Monitorear ubicación de sus hijos en tiempo real
- Ver nivel de batería del dispositivo del hijo
- Recibir notificaciones de alertas (entrada/salida del colegio)
- Ver historial de movimientos

### 🔌 Servicios Backend Consumidos

#### 1. Autenticación
```dart
// POST /api/auth/login
Future<AuthResponse> login(String email, String password)

// GET /api/auth/me
Future<User> getProfile()
```

#### 2. Gestión de Hijos (Solo lectura)
```dart
// GET /api/children/my-children
Future<List<Child>> getMyChildren()

// GET /api/children/:id
Future<Child> getChildDetail(int childId)
```

#### 3. Tracking GPS (Solo lectura para padres)
```dart
// GET /api/tracking/child/:childId/last
Future<Position> getLastPosition(int childId)

// GET /api/tracking/child/:childId/history?from=&to=&limit=
Future<List<Position>> getPositionHistory(
  int childId, 
  DateTime? from, 
  DateTime? to,
  int limit = 50
)
```

#### 4. Alertas
```dart
// GET /api/alerts/my-alerts?isRead=false
Future<List<Alert>> getMyAlerts({bool? onlyUnread})

// GET /api/alerts/unread-count
Future<int> getUnreadCount()

// PATCH /api/alerts/:id/mark-read
Future<void> markAlertAsRead(int alertId)

// PATCH /api/alerts/mark-all-read
Future<void> markAllAlertsAsRead()
```

#### 5. Información de Dispositivo (Solo lectura)
```dart
// GET /api/devices?childId=:id
Future<Device?> getChildDevice(int childId)
```

### 🔐 Tipo de Usuario
- **Role**: `PARENT`
- **Permisos**: Solo ver información de sus propios hijos
- **Token JWT**: Obligatorio en todas las peticiones

### 📦 Features Principales
- ✅ Login con email/password
- ✅ Ver lista de hijos registrados
- ✅ Mapa en tiempo real con ubicación del hijo
- ✅ Indicador de batería del dispositivo
- ✅ Badge de "Dentro/Fuera del colegio"
- ✅ Lista de alertas (entrada/salida)
- ✅ Notificaciones push (FCM)
- ✅ Historial de movimientos en mapa

### 🚫 NO Usa
- ❌ Crear/editar colegios
- ❌ Crear/editar usuarios
- ❌ Crear/editar hijos (solo ve los asignados)
- ❌ Registrar dispositivos manualmente
- ❌ Panel administrativo

---

## 📱 App Móvil Flutter (Tracking - Hijo)

### 🎯 Propósito
Aplicación instalada en el **celular del hijo** que:
- Envía ubicación GPS periódicamente en background
- Envía nivel de batería
- No tiene UI compleja (puede ser solo un servicio en background)

### 🔌 Servicios Backend Consumidos

#### 1. Registro Inicial del Dispositivo
```dart
// POST /api/devices
Future<Device> registerDevice({
  required int schoolId,
  required String deviceUid,
  required String name,
  required String model,
  required String manufacturer,
  required String osVersion,
  required String platform,
  String? fcmToken,
})
```

#### 2. Envío de Posiciones (CRÍTICO)
```dart
// POST /api/tracking/positions
Future<TrackingResponse> sendPosition({
  required String deviceUid,
  required double lat,
  required double lng,
  double? accuracy,
  double? speed,
  double? heading,
  double? altitude,
  int? batteryLevel,
})
```

### 🔓 Tipo de Acceso
- **Sin autenticación JWT** en el endpoint de tracking
- Endpoint **público**: `/api/tracking/positions`
- Identificación por `deviceUid` único

### 📦 Features Principales
- ✅ Background location tracking
- ✅ Envío automático cada X minutos (configurable)
- ✅ Detección de nivel de batería
- ✅ Work Manager / Background Service
- ✅ Persistencia local si no hay internet
- ✅ Sync cuando recupera conexión

### 🚫 NO Usa
- ❌ Login de usuarios
- ❌ Ver mapas
- ❌ Ver alertas
- ❌ CRUD de ningún tipo

---

## 🌐 Panel Web React (Administración)

### 🎯 Propósito
Panel para **administradores del colegio** que permite:
- Gestión completa de usuarios (admins y padres)
- Gestión de hijos
- Gestión de dispositivos
- Monitoreo en tiempo real de todos los niños del colegio
- Dashboard con estadísticas
- Configuración del área segura (integración con QGIS)

### 🔌 Servicios Backend Consumidos

#### 1. Autenticación
```typescript
// POST /api/auth/login
login(email: string, password: string): Promise<AuthResponse>

// GET /api/auth/me
getProfile(): Promise<User>
```

#### 2. Gestión de Colegios (CRUD completo)
```typescript
// POST /api/schools
createSchool(school: CreateSchoolDto): Promise<School>

// GET /api/schools
listSchools(): Promise<School[]>

// GET /api/schools/:id
getSchool(id: number): Promise<School>

// PATCH /api/schools/:id
updateSchool(id: number, data: UpdateSchoolDto): Promise<School>

// DELETE /api/schools/:id
deleteSchool(id: number): Promise<void>
```

#### 3. Gestión de Usuarios (CRUD completo)
```typescript
// POST /api/users
createUser(user: CreateUserDto): Promise<User>

// GET /api/users?role=PARENT
listUsers(role?: UserRole): Promise<User[]>

// GET /api/users/:id
getUser(id: number): Promise<User>

// PATCH /api/users/:id
updateUser(id: number, data: UpdateUserDto): Promise<User>

// DELETE /api/users/:id
deleteUser(id: number): Promise<void>
```

#### 4. Gestión de Hijos (CRUD completo)
```typescript
// POST /api/children
createChild(child: CreateChildDto): Promise<Child>

// GET /api/children
listChildren(): Promise<Child[]>

// GET /api/children/:id
getChild(id: number): Promise<Child>

// PATCH /api/children/:id
updateChild(id: number, data: UpdateChildDto): Promise<Child>

// DELETE /api/children/:id
deleteChild(id: number): Promise<void>
```

#### 5. Gestión de Dispositivos (CRUD completo)
```typescript
// POST /api/devices
createDevice(device: CreateDeviceDto): Promise<Device>

// POST /api/devices/link
linkDevice(deviceUid: string, childId: number): Promise<Device>

// GET /api/devices
listDevices(): Promise<Device[]>

// GET /api/devices/:id
getDevice(id: number): Promise<Device>

// PATCH /api/devices/:id
updateDevice(id: number, data: UpdateDeviceDto): Promise<Device>

// DELETE /api/devices/:id
deleteDevice(id: number): Promise<void>
```

#### 6. Monitoreo Global
```typescript
// GET /api/tracking/school/all-positions
getAllPositions(): Promise<Position[]>

// GET /api/tracking/child/:childId/last
getLastPosition(childId: number): Promise<Position>

// GET /api/tracking/child/:childId/history
getPositionHistory(childId: number, params?: HistoryParams): Promise<Position[]>
```

#### 7. Gestión de Alertas (Todas)
```typescript
// GET /api/alerts?type=EXIT_AREA&isRead=false
listAlerts(filters?: AlertFilters): Promise<Alert[]>

// GET /api/alerts/:id
getAlert(id: number): Promise<Alert>

// PATCH /api/alerts/:id/mark-read
markAlertAsRead(id: number): Promise<Alert>
```

### 🔐 Tipo de Usuario
- **Role**: `SCHOOL_ADMIN`
- **Permisos**: Acceso completo a todos los datos de su colegio
- **Token JWT**: Obligatorio en todas las peticiones
- **Multi-tenant**: Solo ve datos de su `schoolId`

### 📦 Features Principales
- ✅ Dashboard con métricas (total niños, alertas, dispositivos activos)
- ✅ Mapa global con todos los niños del colegio
- ✅ CRUD completo de usuarios (admins y padres)
- ✅ CRUD completo de hijos
- ✅ CRUD completo de dispositivos
- ✅ Panel de alertas en tiempo real
- ✅ Reportes y estadísticas
- ✅ Configuración del colegio
- ✅ Integración con QGIS para definir área segura

---

## 🗺️ QGIS Desktop (Geoespacial)

### 🎯 Propósito
Herramienta GIS para **administradores técnicos** que permite:
- Dibujar/editar el polígono del área segura del colegio
- Visualizar posiciones históricas en mapa
- Análisis espacial

### 🔌 Conexión Backend
- **Conexión directa a PostgreSQL/PostGIS**
- No consume API REST
- Acceso directo a tablas:
  - `schools` (editar campo `geom`)
  - `child_positions` (visualizar solo lectura)

### 📦 Features Principales
- ✅ Conectar a DB PostgreSQL
- ✅ Cargar capa `schools` con geometría editable
- ✅ Dibujar polígonos POLYGON(4326) en `schools.geom`
- ✅ Visualizar capa `child_positions` como puntos
- ✅ Análisis espacial (densidad, rutas, etc.)

### 🚫 NO Usa
- ❌ API REST
- ❌ Autenticación JWT
- ❌ Endpoints HTTP

---

## 📊 Resumen Comparativo

| Funcionalidad | App Padre | App Hijo (Tracking) | Panel Admin | QGIS |
|--------------|-----------|---------------------|-------------|------|
| **Login JWT** | ✅ | ❌ | ✅ | ❌ |
| **Ver hijos propios** | ✅ | ❌ | ✅ (todos) | ❌ |
| **Ver posiciones** | ✅ (propios) | ❌ | ✅ (todos) | ✅ |
| **Enviar posiciones** | ❌ | ✅ | ❌ | ❌ |
| **Ver alertas** | ✅ (propias) | ❌ | ✅ (todas) | ❌ |
| **CRUD Usuarios** | ❌ | ❌ | ✅ | ❌ |
| **CRUD Hijos** | ❌ | ❌ | ✅ | ❌ |
| **CRUD Dispositivos** | ❌ | ✅ (registro) | ✅ | ❌ |
| **CRUD Colegios** | ❌ | ❌ | ✅ | ❌ |
| **Editar geom** | ❌ | ❌ | ❌ | ✅ |
| **Dashboard** | ❌ | ❌ | ✅ | ❌ |

---

## 🔐 Seguridad por Cliente

### App Padre (Flutter)
```dart
// Siempre incluir token
final response = await http.get(
  Uri.parse('$baseUrl/api/children/my-children'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```
- ✅ JWT en header `Authorization`
- ✅ Solo accede a endpoints con role `PARENT`
- ✅ Backend filtra automáticamente por `parentId`

### App Hijo (Tracking)
```dart
// Sin token - endpoint público
final response = await http.post(
  Uri.parse('$baseUrl/api/tracking/positions'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'deviceUid': deviceUid,  // Identificador único
    'lat': lat,
    'lng': lng,
    'batteryLevel': battery,
  }),
);
```
- ❌ Sin JWT
- ✅ Identificación por `deviceUid`
- ✅ Endpoint público: `/api/tracking/positions`

### Panel Admin (React con Axios)
```typescript
// Configurar Axios con interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```
- ✅ JWT en header `Authorization`
- ✅ Solo accede a endpoints con role `SCHOOL_ADMIN`
- ✅ Backend filtra automáticamente por `schoolId`

---

## 📱 Endpoints por Cliente - Tabla de Referencia

### App Móvil (Padre) - SOLO LECTURA

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/auth/login` | Login inicial |
| GET | `/api/auth/me` | Ver perfil |
| GET | `/api/children/my-children` | Lista de hijos |
| GET | `/api/children/:id` | Detalle hijo |
| GET | `/api/tracking/child/:id/last` | Última ubicación |
| GET | `/api/tracking/child/:id/history` | Historial GPS |
| GET | `/api/alerts/my-alerts` | Mis alertas |
| GET | `/api/alerts/unread-count` | Contador alertas |
| PATCH | `/api/alerts/:id/mark-read` | Marcar leída |
| PATCH | `/api/alerts/mark-all-read` | Marcar todas |

**Total: 10 endpoints** (9 GET + 1 POST login)

### App Móvil (Tracking) - SOLO ESCRITURA

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/devices` | Registro inicial (una vez) |
| POST | `/api/tracking/positions` | Envío de GPS (cada X min) |

**Total: 2 endpoints** (ambos POST, sin auth)

### Panel Web (Admin) - CRUD COMPLETO

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil |
| **Schools** |
| POST | `/api/schools` | Crear |
| GET | `/api/schools` | Listar |
| GET | `/api/schools/:id` | Ver |
| PATCH | `/api/schools/:id` | Editar |
| DELETE | `/api/schools/:id` | Eliminar |
| **Users** |
| POST | `/api/users` | Crear |
| GET | `/api/users` | Listar |
| GET | `/api/users/:id` | Ver |
| PATCH | `/api/users/:id` | Editar |
| DELETE | `/api/users/:id` | Eliminar |
| **Children** |
| POST | `/api/children` | Crear |
| GET | `/api/children` | Listar |
| GET | `/api/children/:id` | Ver |
| PATCH | `/api/children/:id` | Editar |
| DELETE | `/api/children/:id` | Eliminar |
| **Devices** |
| POST | `/api/devices` | Crear |
| POST | `/api/devices/link` | Vincular |
| GET | `/api/devices` | Listar |
| GET | `/api/devices/:id` | Ver |
| PATCH | `/api/devices/:id` | Editar |
| DELETE | `/api/devices/:id` | Eliminar |
| **Tracking** |
| GET | `/api/tracking/school/all-positions` | Todas |
| GET | `/api/tracking/child/:id/last` | Última |
| GET | `/api/tracking/child/:id/history` | Historial |
| **Alerts** |
| GET | `/api/alerts` | Todas |
| GET | `/api/alerts/:id` | Ver |
| PATCH | `/api/alerts/:id/mark-read` | Marcar |

**Total: 31 endpoints** (CRUD completo)

---

## 🎯 Recomendaciones de Implementación

### Flutter (App Padre)
```dart
// Estructura de servicios
lib/
  services/
    auth_service.dart
    children_service.dart
    tracking_service.dart
    alerts_service.dart
  models/
    user.dart
    child.dart
    position.dart
    alert.dart
  screens/
    login_screen.dart
    home_screen.dart        // Lista de hijos
    child_map_screen.dart   // Mapa con ubicación
    alerts_screen.dart
```

### Flutter (App Tracking - Hijo)
```dart
// Estructura minimalista
lib/
  services/
    device_service.dart
    location_service.dart
    background_service.dart
  main.dart  // Solo inicialización
```

### React (Panel Admin)
```typescript
// Estructura modular
src/
  components/
    auth/
    dashboard/
    schools/
    users/
    children/
    devices/
    tracking/
    alerts/
    common/
  services/
    api.ts
    auth.ts
  hooks/
    useAuth.ts
    useApi.ts
  contexts/
    AuthContext.tsx
  utils/
    axios-config.ts
```

---

## 🚀 Próximos Pasos

1. **Flutter App Padre**: Implementar 10 endpoints de lectura + UI de mapas
2. **Flutter App Tracking**: Implementar 2 endpoints + background service
3. **React Panel**: Implementar 31 endpoints con Axios + dashboard completo
4. **QGIS**: Documentar conexión a PostGIS + tutorial de edición de polígonos
