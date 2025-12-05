# 📱 API Reference - App Móvil Flutter

**Base URL:** `http://localhost:3000/api` (desarrollo)
**Producción:** `https://tu-app-runner-url.us-east-1.awsapprunner.com/api`

**Versión:** 1.0.2 | **Última actualización:** 28 Nov 2025

---

## 📦 Configuración Dart/Flutter

```dart
// lib/core/api/api_client.dart
import 'package:dio/dio.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:3000/api';
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    contentType: 'application/json',
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ));
  
  String? _token;
  
  void setToken(String token) {
    _token = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  void clearToken() {
    _token = null;
    _dio.options.headers.remove('Authorization');
  }
  
  Dio get dio => _dio;
}
```

---

## 📦 Modelo de Respuesta

```dart
// lib/core/models/api_response.dart
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? code;
  final List<String>? details;
  
  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.code,
    this.details,
  });
  
  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromData) {
    return ApiResponse(
      success: json['success'],
      message: json['message'],
      data: json['data'] != null && fromData != null ? fromData(json['data']) : json['data'],
      code: json['code'],
      details: json['details'] != null ? List<String>.from(json['details']) : null,
    );
  }
}
```

---

# 🧑‍💼 MODO PADRE / TUTOR

## 1️⃣ Autenticación

### `POST /auth/login`
Login del padre.

```dart
// lib/features/auth/data/auth_repository.dart
Future<AuthResponse> login(String email, String password) async {
  final response = await _api.dio.post('/auth/login', data: {
    'email': email,
    'password': password,
  });
  
  if (response.data['success']) {
    final data = response.data['data'];
    final token = data['accessToken'];
    _api.setToken(token);
    
    // Guardar en secure storage
    await _secureStorage.write(key: 'token', value: token);
    
    return AuthResponse.fromJson(data);
  }
  
  throw AuthException(response.data['message']);
}
```

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "email": "padre@gmail.com",
      "fullName": "María García",
      "role": "PARENT",
      "schoolId": 1,
      "school": {
        "id": 1,
        "name": "Colegio Boliviano Americano"
      }
    }
  }
}
```

---

### `POST /auth/register`
Registro de nuevo padre.

```dart
Future<void> register({
  required int schoolId,
  required String email,
  required String password,
  required String fullName,
  String? phone,
}) async {
  final response = await _api.dio.post('/auth/register', data: {
    'schoolId': schoolId,
    'email': email,
    'password': password,
    'fullName': fullName,
    'phone': phone,
    'role': 'PARENT',
  });
  
  if (!response.data['success']) {
    throw AuthException(response.data['message']);
  }
}
```

---

### `GET /auth/me`
Obtener perfil del padre logueado.

```dart
Future<User> getProfile() async {
  final response = await _api.dio.get('/auth/me');
  
  if (response.data['success']) {
    return User.fromJson(response.data['data']);
  }
  
  throw AuthException(response.data['message']);
}
```

---

## 2️⃣ Mis Hijos

### `GET /children/my-children`
Lista de hijos del padre logueado.

```dart
// lib/features/children/data/children_repository.dart
Future<List<Child>> getMyChildren() async {
  final response = await _api.dio.get('/children/my-children');
  
  if (response.data['success']) {
    final List<dynamic> data = response.data['data'];
    return data.map((json) => Child.fromJson(json)).toList();
  }
  
  throw ApiException(response.data['message']);
}
```

**Response:**
```json
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
      "devices": [
        {
          "id": 1,
          "name": "Samsung A13",
          "model": "SM-A135F",
          "lastBatteryLevel": 85,
          "lastSeen": "2025-11-27T12:30:00.000Z"
        }
      ]
    }
  ]
}
```

**Modelo Dart:**
```dart
// lib/features/children/domain/child.dart
class Child {
  final int id;
  final String fullName;
  final int age;
  final String grade;
  final String status;
  final List<Device>? devices;
  
  Child({
    required this.id,
    required this.fullName,
    required this.age,
    required this.grade,
    required this.status,
    this.devices,
  });
  
  factory Child.fromJson(Map<String, dynamic> json) {
    return Child(
      id: json['id'],
      fullName: json['fullName'],
      age: json['age'],
      grade: json['grade'],
      status: json['status'],
      devices: json['devices'] != null
          ? (json['devices'] as List).map((d) => Device.fromJson(d)).toList()
          : null,
    );
  }
}
```

---

### `GET /children/:childId`
Detalle de un hijo específico.

```dart
Future<Child> getChildDetail(int childId) async {
  final response = await _api.dio.get('/children/$childId');
  
  if (response.data['success']) {
    return Child.fromJson(response.data['data']);
  }
  
  throw ApiException(response.data['message']);
}
```

---

## 3️⃣ Ubicación del Hijo

### `GET /tracking/child/:childId/last`
**⭐ ENDPOINT PRINCIPAL PARA MOSTRAR EN MAPA**

Última ubicación del hijo.

```dart
// lib/features/tracking/data/tracking_repository.dart
Future<Position> getChildLastPosition(int childId) async {
  final response = await _api.dio.get('/tracking/child/$childId/last');
  
  if (response.data['success']) {
    return Position.fromJson(response.data['data']);
  }
  
  throw ApiException(response.data['message']);
}
```

**Response:**
```json
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

**Modelo Dart:**
```dart
// lib/features/tracking/domain/position.dart
class Position {
  final int id;
  final int childId;
  final double lat;
  final double lng;
  final double? accuracy;
  final double? speed;
  final double? heading;
  final double? altitude;
  final int? batteryLevel;
  final DateTime createdAt;
  
  Position({
    required this.id,
    required this.childId,
    required this.lat,
    required this.lng,
    this.accuracy,
    this.speed,
    this.heading,
    this.altitude,
    this.batteryLevel,
    required this.createdAt,
  });
  
  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(
      id: json['id'],
      childId: json['childId'],
      lat: json['lat'].toDouble(),
      lng: json['lng'].toDouble(),
      accuracy: json['accuracy']?.toDouble(),
      speed: json['speed']?.toDouble(),
      heading: json['heading']?.toDouble(),
      altitude: json['altitude']?.toDouble(),
      batteryLevel: json['batteryLevel'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
```

---

### `GET /tracking/child/:childId/history`
Historial de posiciones para pintar ruta.

```dart
Future<List<Position>> getChildPositionHistory(int childId, {int limit = 50}) async {
  final response = await _api.dio.get(
    '/tracking/child/$childId/history',
    queryParameters: {'limit': limit},
  );
  
  if (response.data['success']) {
    final List<dynamic> data = response.data['data'];
    return data.map((json) => Position.fromJson(json)).toList();
  }
  
  throw ApiException(response.data['message']);
}
```

---

## 4️⃣ Alertas del Padre

### `GET /alerts/my-alerts`
Listado de alertas de todos los hijos del padre.

```dart
// lib/features/alerts/data/alerts_repository.dart
Future<List<Alert>> getMyAlerts({bool? isRead}) async {
  final response = await _api.dio.get(
    '/alerts/my-alerts',
    queryParameters: isRead != null ? {'isRead': isRead} : null,
  );
  
  if (response.data['success']) {
    final List<dynamic> data = response.data['data'];
    return data.map((json) => Alert.fromJson(json)).toList();
  }
  
  throw ApiException(response.data['message']);
}
```

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "type": "EXIT_AREA",
      "message": "Pedrito García ha salido del área segura",
      "isRead": false,
      "createdAt": "2025-11-27T12:25:00.000Z",
      "child": {
        "id": 1,
        "fullName": "Pedrito García"
      }
    }
  ]
}
```

---

### `GET /alerts/unread-count`
Contador de alertas no leídas (para badge).

```dart
Future<int> getUnreadCount() async {
  final response = await _api.dio.get('/alerts/unread-count');
  
  if (response.data['success']) {
    return response.data['data']['count'];
  }
  
  return 0;
}
```

---

### `PATCH /alerts/:id/mark-read`
Marcar alerta como leída.

```dart
Future<void> markAsRead(int alertId) async {
  await _api.dio.patch('/alerts/$alertId/mark-read');
}
```

---

# 👦 MODO HIJO / DISPOSITIVO RASTREADOR

> **Este modo es para el dispositivo del niño que envía posiciones GPS en background.**

## 1️⃣ Obtener Info del Dispositivo

```dart
// lib/core/services/device_service.dart
import 'package:device_info_plus/device_info_plus.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'dart:io';

class DeviceService {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  
  Future<Map<String, dynamic>> getDeviceData() async {
    String deviceUid = '';
    String name = '';
    String model = '';
    String manufacturer = '';
    String osVersion = '';
    String platform = '';
    
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      deviceUid = androidInfo.id;
      name = androidInfo.device;
      model = androidInfo.model;
      manufacturer = androidInfo.manufacturer;
      osVersion = 'Android ${androidInfo.version.release}';
      platform = 'android';
    } else if (Platform.isIOS) {
      final iosInfo = await _deviceInfo.iosInfo;
      deviceUid = iosInfo.identifierForVendor ?? '';
      name = iosInfo.name;
      model = iosInfo.model;
      manufacturer = 'Apple';
      osVersion = 'iOS ${iosInfo.systemVersion}';
      platform = 'ios';
    }
    
    final fcmToken = await FirebaseMessaging.instance.getToken();
    
    return {
      'deviceUid': deviceUid,
      'name': name,
      'model': model,
      'manufacturer': manufacturer,
      'osVersion': osVersion,
      'platform': platform,
      'fcmToken': fcmToken,
    };
  }
}
```

---

## 2️⃣ Pairing del Dispositivo (QR Code Flow)

### `POST /devices/pair` 🔓 PÚBLICO
**⚡ ENDPOINT PÚBLICO - NO REQUIERE AUTENTICACIÓN**

Registra el dispositivo y lo vincula al niño en un solo paso.
Este endpoint es llamado desde el **modo hijo** después de escanear el código QR generado por el padre.

**El código QR del padre contiene:**
```json
{
  "childId": 1,
  "schoolId": 1
}
```

```dart
// lib/features/child_mode/data/pairing_repository.dart
import 'package:dio/dio.dart';

class PairingRepository {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://tu-backend.com/api',
    contentType: 'application/json',
  ));
  
  /// Realiza el pairing del dispositivo con el hijo
  /// [qrData] - Datos extraídos del QR (childId, schoolId)
  /// [deviceData] - Información del dispositivo (deviceUid, model, etc.)
  Future<PairingResponse> pairDevice({
    required Map<String, dynamic> qrData,
    required Map<String, dynamic> deviceData,
  }) async {
    final response = await _dio.post('/devices/pair', data: {
      'schoolId': qrData['schoolId'],
      'childId': qrData['childId'],
      'deviceUid': deviceData['deviceUid'],
      'name': deviceData['name'],
      'model': deviceData['model'],
      'manufacturer': deviceData['manufacturer'],
      'osVersion': deviceData['osVersion'],
      'platform': deviceData['platform'],
      'fcmToken': deviceData['fcmToken'],
    });
    
    return PairingResponse.fromJson(response.data);
  }
}

// Modelo de respuesta
class PairingResponse {
  final bool success;
  final String message;
  final DeviceInfo? device;
  final ChildInfo? child;
  
  PairingResponse({
    required this.success,
    required this.message,
    this.device,
    this.child,
  });
  
  factory PairingResponse.fromJson(Map<String, dynamic> json) {
    return PairingResponse(
      success: json['success'],
      message: json['message'],
      device: json['device'] != null ? DeviceInfo.fromJson(json['device']) : null,
      child: json['child'] != null ? ChildInfo.fromJson(json['child']) : null,
    );
  }
}
```

**Request Body:**
```json
{
  "schoolId": 1,
  "childId": 1,
  "deviceUid": "abc123def456",
  "name": "Samsung Galaxy S21",
  "model": "SM-G991B",
  "manufacturer": "Samsung",
  "osVersion": "Android 13",
  "platform": "android",
  "fcmToken": "cXyz..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Dispositivo registrado y vinculado correctamente",
  "device": {
    "id": 5,
    "deviceUid": "abc123def456",
    "name": "Samsung Galaxy S21",
    "model": "SM-G991B",
    "manufacturer": "Samsung",
    "osVersion": "Android 13",
    "platform": "android",
    "fcmToken": "cXyz...",
    "childId": 1,
    "schoolId": 1,
    "lastSeen": "2025-11-28T10:30:00.000Z",
    "child": {
      "id": 1,
      "fullName": "Pedrito García",
      "grade": "3ro Primaria"
    }
  },
  "child": {
    "id": 1,
    "fullName": "Pedrito García",
    "grade": "3ro Primaria",
    "parent": {
      "id": 2,
      "fullName": "María García"
    }
  }
}
```

**Response (Error - Hijo no encontrado):**
```json
{
  "success": false,
  "message": "Hijo no encontrado",
  "code": "NOT_FOUND"
}
```

---

## 3️⃣ Flujo Completo de Pairing (QR)

```dart
// lib/features/child_mode/presentation/qr_scanner_screen.dart
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerScreen extends StatefulWidget {
  @override
  _QrScannerScreenState createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final PairingRepository _pairingRepo = PairingRepository();
  final DeviceService _deviceService = DeviceService();
  bool _isProcessing = false;
  
  Future<void> _onQrDetected(BarcodeCapture capture) async {
    if (_isProcessing) return;
    
    final String? code = capture.barcodes.first.rawValue;
    if (code == null) return;
    
    setState(() => _isProcessing = true);
    
    try {
      // 1. Parsear datos del QR
      final qrData = jsonDecode(code);
      
      // Validar que tenga los campos requeridos
      if (qrData['childId'] == null || qrData['schoolId'] == null) {
        throw Exception('QR inválido');
      }
      
      // 2. Obtener información del dispositivo
      final deviceData = await _deviceService.getDeviceData();
      
      // 3. Realizar pairing
      final response = await _pairingRepo.pairDevice(
        qrData: qrData,
        deviceData: deviceData,
      );
      
      if (response.success) {
        // Guardar configuración local
        await _saveChildModeConfig(
          childId: response.child!.id,
          childName: response.child!.fullName,
          deviceUid: deviceData['deviceUid'],
        );
        
        // Iniciar servicio de tracking
        await LocationTrackingService.start(deviceData['deviceUid']);
        
        // Navegar a pantalla de modo hijo activo
        Navigator.pushReplacementNamed(context, '/child-mode-active');
      } else {
        _showError(response.message);
      }
      
    } catch (e) {
      _showError('Error al procesar QR: $e');
    } finally {
      setState(() => _isProcessing = false);
    }
  }
  
  Future<void> _saveChildModeConfig({
    required int childId,
    required String childName,
    required String deviceUid,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isChildMode', true);
    await prefs.setInt('childId', childId);
    await prefs.setString('childName', childName);
    await prefs.setString('deviceUid', deviceUid);
  }
  
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Escanear QR del Padre')),
      body: Stack(
        children: [
          MobileScanner(onDetect: _onQrDetected),
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }
}
```

---

## 4️⃣ Envío de Posiciones GPS (Background Service)

### `POST /tracking/positions` 🔓 PÚBLICO
**⚡ ENDPOINT CRÍTICO - NO REQUIERE AUTENTICACIÓN**

Enviar posición GPS del dispositivo.

```dart
// lib/core/services/location_service.dart
import 'package:geolocator/geolocator.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:dio/dio.dart';

class LocationService {
  static const String apiUrl = 'http://tu-backend.com/api/tracking/positions';
  final Dio _dio = Dio();
  final Battery _battery = Battery();
  final String deviceUid;
  
  LocationService({required this.deviceUid});
  
  Future<void> sendPosition() async {
    try {
      // Obtener ubicación actual
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      // Obtener nivel de batería
      final batteryLevel = await _battery.batteryLevel;
      
      // Enviar al backend
      final response = await _dio.post(apiUrl, data: {
        'deviceUid': deviceUid,
        'lat': position.latitude,
        'lng': position.longitude,
        'accuracy': position.accuracy,
        'speed': position.speed,
        'heading': position.heading,
        'altitude': position.altitude,
        'batteryLevel': batteryLevel,
      });
      
      print('Position sent: ${response.data}');
      
    } catch (e) {
      print('Error sending position: $e');
    }
  }
}
```

**Request:**
```json
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

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "position": {
      "id": 123,
      "childId": 1,
      "lat": -17.783,
      "lng": -63.182,
      "batteryLevel": 85,
      "createdAt": "2025-11-27T12:30:00.000Z"
    },
    "isWithinArea": false,
    "alertCreated": true
  }
}
```

---

## 4️⃣ Background Service (Android)

```dart
// lib/core/services/background_service.dart
import 'package:workmanager/workmanager.dart';

const backgroundTaskName = 'sendLocationTask';

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    if (task == backgroundTaskName) {
      final deviceUid = inputData?['deviceUid'] as String?;
      if (deviceUid != null) {
        final locationService = LocationService(deviceUid: deviceUid);
        await locationService.sendPosition();
      }
    }
    return true;
  });
}

class BackgroundService {
  static Future<void> initialize() async {
    await Workmanager().initialize(callbackDispatcher);
  }
  
  static Future<void> startPeriodicTask(String deviceUid) async {
    await Workmanager().registerPeriodicTask(
      'location-tracker',
      backgroundTaskName,
      frequency: Duration(minutes: 15), // Mínimo en Android
      inputData: {'deviceUid': deviceUid},
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }
  
  static Future<void> stopTask() async {
    await Workmanager().cancelAll();
  }
}
```

---

## 📊 Resumen de Endpoints por Modo

### 🧑‍💼 Modo Padre

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/auth/login` | POST | Login |
| `/auth/register` | POST | Registro |
| `/auth/me` | GET | Perfil |
| `/children/my-children` | GET | Mis hijos |
| `/children/:id` | GET | Detalle hijo |
| `/tracking/child/:id/last` | GET | **Última ubicación** |
| `/tracking/child/:id/history` | GET | Historial ruta |
| `/alerts/my-alerts` | GET | Mis alertas |
| `/alerts/unread-count` | GET | Badge alertas |
| `/alerts/:id/mark-read` | PATCH | Marcar leída |

### 👦 Modo Hijo (Tracker)

| Endpoint | Método | Auth | Uso |
|----------|--------|------|-----|
| `/devices` | POST | 🔒 | Registrar dispositivo (padre) |
| `/devices/link` | POST | 🔒 | Vincular a hijo (padre) |
| `/tracking/positions` | POST | 🔓 | **Enviar GPS (background)** |

---

## 📦 Dependencias pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP Client
  dio: ^5.4.0
  
  # Almacenamiento seguro
  flutter_secure_storage: ^9.0.0
  
  # Información del dispositivo
  device_info_plus: ^9.1.0
  
  # GPS
  geolocator: ^11.0.0
  
  # Batería
  battery_plus: ^5.0.0
  
  # Push Notifications
  firebase_messaging: ^14.7.0
  firebase_core: ^2.24.0
  
  # Background tasks
  workmanager: ^0.5.2
  
  # Mapas
  google_maps_flutter: ^2.5.0
  # o
  flutter_map: ^6.1.0
  latlong2: ^0.9.0
  
  # State management
  flutter_riverpod: ^2.4.0
  # o
  flutter_bloc: ^8.1.0
```

---

## 🏗️ Estructura de Proyecto Sugerida

```
lib/
├── core/
│   ├── api/
│   │   └── api_client.dart
│   ├── models/
│   │   └── api_response.dart
│   └── services/
│       ├── device_service.dart
│       ├── location_service.dart
│       └── background_service.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository.dart
│   │   ├── domain/
│   │   │   └── user.dart
│   │   └── presentation/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── children/
│   │   ├── data/
│   │   │   └── children_repository.dart
│   │   ├── domain/
│   │   │   └── child.dart
│   │   └── presentation/
│   │       └── children_list_screen.dart
│   ├── tracking/
│   │   ├── data/
│   │   │   └── tracking_repository.dart
│   │   ├── domain/
│   │   │   └── position.dart
│   │   └── presentation/
│   │       └── map_screen.dart
│   └── alerts/
│       ├── data/
│       │   └── alerts_repository.dart
│       ├── domain/
│       │   └── alert.dart
│       └── presentation/
│           └── alerts_screen.dart
└── main.dart
```
