# 🧪 Smoke Tests - Backend Geofencing

Scripts de PowerShell para probar el flujo completo del backend con el modelo actualizado (`deviceUid`, `age`, `batteryLevel`).

## 🎯 Flujo Completo

### 1️⃣ Crear Colegio

```powershell
$school = Invoke-RestMethod -Uri "http://localhost:3000/api/schools" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "name": "Colegio San Martín",
    "address": "Av. Principal 123, Santa Cruz",
    "phone": "+591 3 1234567"
  }'

Write-Host "✅ Colegio creado: ID = $($school.id)"
```

---

### 2️⃣ Crear Admin del Colegio

```powershell
$admin = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "schoolId": 1,
    "email": "admin@sanmartin.edu",
    "password": "admin123",
    "fullName": "Juan Pérez Admin",
    "phone": "+591 70000001",
    "role": "SCHOOL_ADMIN"
  }'

Write-Host "✅ Admin creado: ID = $($admin.id)"
```

---

### 3️⃣ Login y Obtener Token

```powershell
$auth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "email": "admin@sanmartin.edu",
    "password": "admin123"
  }'

$token = $auth.accessToken
Write-Host "✅ Token obtenido: $($token.Substring(0, 20))..."
```

---

### 4️⃣ Crear Padre

```powershell
$parent = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId": 1,
    "email": "padre@gmail.com",
    "password": "padre123",
    "fullName": "María García",
    "phone": "+591 77123456",
    "role": "PARENT"
  }'

Write-Host "✅ Padre creado: ID = $($parent.id)"
```

---

### 5️⃣ Crear Hijo (con age)

```powershell
$child = Invoke-RestMethod -Uri "http://localhost:3000/api/children" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId": 1,
    "parentId": 2,
    "fullName": "Pedrito García",
    "age": 8,
    "grade": "3ro Primaria"
  }'

Write-Host "✅ Hijo creado: ID = $($child.id), Edad = $($child.age)"
```

---

### 6️⃣ Registrar Dispositivo

```powershell
$device = Invoke-RestMethod -Uri "http://localhost:3000/api/devices" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId": 1,
    "deviceUid": "android-abc123-unique-id",
    "name": "Celular de Pedrito",
    "model": "Samsung Galaxy A13",
    "manufacturer": "Samsung",
    "osVersion": "Android 14",
    "platform": "android",
    "fcmToken": "fcm-token-ejemplo"
  }'

Write-Host "✅ Dispositivo registrado: UID = $($device.deviceUid)"
Write-Host "   Modelo: $($device.model)"
```

---

### 7️⃣ Vincular Dispositivo con Hijo

```powershell
$link = Invoke-RestMethod -Uri "http://localhost:3000/api/devices/link" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "deviceUid": "android-abc123-unique-id",
    "childId": 1
  }'

Write-Host "✅ Dispositivo vinculado al hijo: $($link.child.fullName)"
```

---

### 8️⃣ Enviar Posición GPS (Público - desde Flutter)

```powershell
$position = Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/positions" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "deviceUid": "android-abc123-unique-id",
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "heading": 90,
    "altitude": 420,
    "batteryLevel": 85
  }'

Write-Host "✅ Posición guardada: ID = $($position.position.id)"
Write-Host "   Coordenadas: ($($position.position.lat), $($position.position.lng))"
Write-Host "   Batería: $($position.position.batteryLevel)%"
Write-Host "   Dentro del área: $($position.isWithinArea)"

if ($position.alertCreated) {
  Write-Host "🚨 Alerta generada: $($position.alert.type)"
  Write-Host "   Mensaje: $($position.alert.message)"
}
```

---

### 9️⃣ Ver Última Posición del Hijo

```powershell
$lastPosition = Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/child/1/last" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }

Write-Host "📍 Última posición:"
Write-Host "   Timestamp: $($lastPosition.createdAt)"
Write-Host "   Coordenadas: ($($lastPosition.lat), $($lastPosition.lng))"
Write-Host "   Batería: $($lastPosition.batteryLevel)%"
```

---

### 🔟 Ver Alertas del Padre

```powershell
# Login como padre
$parentAuth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "email": "padre@gmail.com",
    "password": "padre123"
  }'

$parentToken = $parentAuth.accessToken

# Ver alertas
$alerts = Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/my-alerts" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $parentToken" }

Write-Host "🚨 Alertas del padre: $($alerts.Count)"
foreach ($alert in $alerts) {
  Write-Host "   [$($alert.type)] $($alert.message)"
  Write-Host "   Leída: $($alert.isRead)"
}
```

---

## 🔄 Script Completo (Ejecutar Todo)

```powershell
# Script completo de smoke tests
Write-Host "🚀 Iniciando smoke tests del backend..." -ForegroundColor Cyan

# 1. Crear colegio
Write-Host "`n1️⃣ Creando colegio..." -ForegroundColor Yellow
$school = Invoke-RestMethod -Uri "http://localhost:3000/api/schools" `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"Colegio San Martín","address":"Av. Principal 123"}'
Write-Host "✅ Colegio creado: ID = $($school.id)" -ForegroundColor Green

# 2. Crear admin
Write-Host "`n2️⃣ Creando admin..." -ForegroundColor Yellow
$admin = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "schoolId":1,
    "email":"admin@sanmartin.edu",
    "password":"admin123",
    "fullName":"Juan Pérez",
    "role":"SCHOOL_ADMIN"
  }'
Write-Host "✅ Admin creado: ID = $($admin.id)" -ForegroundColor Green

# 3. Login
Write-Host "`n3️⃣ Obteniendo token..." -ForegroundColor Yellow
$auth = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@sanmartin.edu","password":"admin123"}'
$token = $auth.accessToken
Write-Host "✅ Token obtenido" -ForegroundColor Green

# 4. Crear padre
Write-Host "`n4️⃣ Creando padre..." -ForegroundColor Yellow
$parent = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId":1,
    "email":"padre@gmail.com",
    "password":"padre123",
    "fullName":"María García",
    "role":"PARENT"
  }'
Write-Host "✅ Padre creado: ID = $($parent.id)" -ForegroundColor Green

# 5. Crear hijo
Write-Host "`n5️⃣ Creando hijo..." -ForegroundColor Yellow
$child = Invoke-RestMethod -Uri "http://localhost:3000/api/children" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId":1,
    "parentId":2,
    "fullName":"Pedrito García",
    "age":8,
    "grade":"3ro Primaria"
  }'
Write-Host "✅ Hijo creado: ID = $($child.id), Edad = $($child.age)" -ForegroundColor Green

# 6. Registrar dispositivo
Write-Host "`n6️⃣ Registrando dispositivo..." -ForegroundColor Yellow
$device = Invoke-RestMethod -Uri "http://localhost:3000/api/devices" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "schoolId":1,
    "deviceUid":"android-test-123",
    "name":"Celular de Pedrito",
    "model":"Samsung Galaxy A13",
    "manufacturer":"Samsung",
    "osVersion":"Android 14",
    "platform":"android"
  }'
Write-Host "✅ Dispositivo registrado: $($device.deviceUid)" -ForegroundColor Green

# 7. Vincular dispositivo
Write-Host "`n7️⃣ Vinculando dispositivo..." -ForegroundColor Yellow
$link = Invoke-RestMethod -Uri "http://localhost:3000/api/devices/link" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"deviceUid":"android-test-123","childId":1}'
Write-Host "✅ Dispositivo vinculado al hijo: $($link.child.fullName)" -ForegroundColor Green

# 8. Enviar posición
Write-Host "`n8️⃣ Enviando posición GPS..." -ForegroundColor Yellow
$position = Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/positions" `
  -Method POST -ContentType "application/json" `
  -Body '{
    "deviceUid":"android-test-123",
    "lat":-17.783,
    "lng":-63.182,
    "accuracy":10,
    "speed":0,
    "batteryLevel":85
  }'
Write-Host "✅ Posición guardada: ID = $($position.position.id)" -ForegroundColor Green
Write-Host "   Batería: $($position.position.batteryLevel)%" -ForegroundColor Cyan
Write-Host "   Dentro del área: $($position.isWithinArea)" -ForegroundColor Cyan

if ($position.alertCreated) {
  Write-Host "🚨 Alerta generada: $($position.alert.type)" -ForegroundColor Red
}

Write-Host "`n✅ Smoke tests completados exitosamente!" -ForegroundColor Green
```

---

## 📋 Checklist de Validación

- [ ] Colegio se crea sin campo `code`
- [ ] Admin se crea correctamente
- [ ] Login devuelve token JWT válido
- [ ] Padre se crea con role PARENT
- [ ] Hijo se crea con campo `age`
- [ ] Dispositivo se registra con `deviceUid` (no `deviceId`)
- [ ] Dispositivo incluye `model`, `manufacturer`, `osVersion`, `platform`
- [ ] Link dispositivo ↔ hijo funciona con `deviceUid`
- [ ] Posición se guarda con `deviceUid` en lugar de `childId`
- [ ] Posición guarda `batteryLevel`
- [ ] `Device.lastBatteryLevel` se actualiza
- [ ] `Device.lastSeen` se actualiza
- [ ] Si hay cambio de estado (dentro/fuera), se genera alerta
- [ ] Alertas se filtran correctamente por padre

---

## 🎯 Comandos Útiles

### Ver todas las posiciones de un hijo
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/tracking/child/1/history?limit=10" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Contador de alertas no leídas
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/unread-count" `
  -Headers @{ Authorization = "Bearer $parentToken" }
```

### Marcar alerta como leída
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/1/mark-read" `
  -Method PATCH `
  -Headers @{ Authorization = "Bearer $parentToken" }
```

### Ver perfil actual
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }
```
