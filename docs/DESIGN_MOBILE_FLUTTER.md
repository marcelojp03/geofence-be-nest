# 📱 Propuesta de Diseño - App Móvil Flutter

**Proyecto:** Sistema de Geofencing Escolar
**Versión:** 1.0
**Fecha:** Diciembre 2025

---

## 📐 Arquitectura de Pantallas

```
┌─────────────────────────────────────────────────────────────┐
│                    APP MÓVIL FLUTTER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MODO PADRE                      MODO HIJO                  │
│  ───────────                     ──────────                 │
│  • Home (Mis hijos)              • Pantalla activa          │
│  • Detalle hijo + Mapa           • Estado de tracking       │
│  • Historial de rutas            • Info del niño vinculado  │
│  • Alertas                                                   │
│  • Perfil                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 🧑‍💼 MODO PADRE

## 1️⃣ Splash + Selector de Modo

### Layout
```
┌─────────────────────────────┐
│                             │
│                             │
│          🛡️               │
│       GeoFence              │
│        Escolar              │
│                             │
│                             │
├─────────────────────────────┤
│                             │
│  ¿Cómo deseas usar la app?  │
│                             │
│  ┌───────────────────────┐  │
│  │  👨‍👩‍👧 SOY PADRE/TUTOR   │  │
│  │  Monitorear a mis hijos │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  👦 MODO HIJO         │  │
│  │  Configurar rastreador │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## 2️⃣ Login (Padre)

### Layout
```
┌─────────────────────────────┐
│  ←                          │
├─────────────────────────────┤
│                             │
│          🛡️               │
│     Iniciar Sesión          │
│                             │
│  ┌───────────────────────┐  │
│  │ 📧 Email              │  │
│  │ padre@email.com       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔒 Contraseña         │  │
│  │ ••••••••              │  │
│  └───────────────────────┘  │
│                             │
│  [ ═══ INICIAR SESIÓN ═══ ] │
│                             │
│  ¿No tienes cuenta?         │
│  Regístrate aquí            │
│                             │
│  ─────── o ───────          │
│                             │
│  Seleccionar colegio ▼      │
│                             │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              Logo(),
              SizedBox(height: 48),
              CustomTextField(
                label: 'Email',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              CustomTextField(
                label: 'Contraseña',
                icon: Icons.lock_outlined,
                obscureText: true,
              ),
              SizedBox(height: 24),
              PrimaryButton(
                text: 'Iniciar Sesión',
                onPressed: () => _login(),
              ),
              TextButton(
                child: Text('¿No tienes cuenta? Regístrate'),
                onPressed: () => Navigator.pushNamed(context, '/register'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 3️⃣ Home - Mis Hijos

### Layout
```
┌─────────────────────────────┐
│  👋 Hola, María             │
│  Viernes, 6 Dic 2025        │
├─────────────────────────────┤
│                             │
│  🔔 3 alertas sin leer      │
│  └─ Toca para ver           │
│                             │
├─────────────────────────────┤
│  Mis hijos                  │
│                             │
│ ┌─────────────────────────┐ │
│ │ ┌───┐                   │ │
│ │ │👦│ Matias Jimenez     │ │
│ │ └───┘ 2do A Secundaria  │ │
│ │                         │ │
│ │ 🟢 En el colegio        │ │
│ │ 📍 Hace 2 min           │ │
│ │ 🔋 78%                   │ │
│ │                 [→]     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ┌───┐                   │ │
│ │ │👧│ Sofia Jimenez      │ │
│ │ └───┘ 4to B Primaria    │ │
│ │                         │ │
│ │ 🔴 Fuera del área       │ │
│ │ 📍 Hace 15 min          │ │
│ │ 🔋 45%                   │ │
│ │                 [→]     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  + Agregar código QR    │ │
│ │    de nuevo hijo        │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│  🏠    📍    🔔    👤      │
│ Home  Mapa  Alertas Perfil  │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header con saludo
            HeaderWidget(userName: 'María'),
            
            // Banner de alertas sin leer
            AlertsBanner(unreadCount: 3),
            
            // Lista de hijos
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.all(16),
                itemCount: children.length,
                itemBuilder: (context, index) {
                  return ChildCard(
                    child: children[index],
                    onTap: () => Navigator.pushNamed(
                      context, 
                      '/child-detail',
                      arguments: children[index].id,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(currentIndex: 0),
    );
  }
}

// Card de hijo
class ChildCard extends StatelessWidget {
  final ChildModel child;
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(child.fullName[0]),
        ),
        title: Text(child.fullName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(child.grade),
            SizedBox(height: 8),
            Row(
              children: [
                StatusBadge(isInArea: child.isInArea),
                SizedBox(width: 8),
                Text('📍 ${child.lastSeenAgo}'),
                SizedBox(width: 8),
                BatteryIndicator(level: child.batteryLevel),
              ],
            ),
          ],
        ),
        trailing: Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
```

---

## 4️⃣ Detalle del Hijo + Mapa

### Layout
```
┌─────────────────────────────┐
│ ← Matias Jimenez      ⋮    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │     🗺️ MAPA GRANDE      │ │
│ │                         │ │
│ │    📍 Posición actual   │ │
│ │       (animado)         │ │
│ │                         │ │
│ │   ┌─────────────┐       │ │
│ │   │  Geofence   │       │ │
│ │   │   🏫        │       │ │
│ │   └─────────────┘       │ │
│ │                         │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│                             │
│  🟢 En el colegio           │
│  Última actualización: 14:25│
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 78% │ │ 2.4 │ │5h30m│    │
│ │ 🔋  │ │ km  │ │ ⏱️  │    │
│ │bater│ │ hoy │ │área │    │
│ └─────┘ └─────┘ └─────┘    │
│                             │
├─────────────────────────────┤
│  📅 Ver historial del día   │
├─────────────────────────────┤
│  🔔 Últimas alertas         │
│  ├─ 🔴 12:35 Salió del área │
│  ├─ 🟢 12:42 Entró al área  │
│  └─ Ver más...              │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class ChildDetailScreen extends StatelessWidget {
  final int childId;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(child.fullName),
        actions: [
          PopupMenuButton(
            itemBuilder: (context) => [
              PopupMenuItem(child: Text('Generar QR')),
              PopupMenuItem(child: Text('Editar')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Mapa con posición actual
          Expanded(
            flex: 2,
            child: FlutterMap(
              options: MapOptions(
                center: LatLng(child.lat, child.lng),
                zoom: 16,
              ),
              children: [
                TileLayer(urlTemplate: '...'),
                // Geofence del colegio
                PolygonLayer(
                  polygons: [schoolGeofence],
                ),
                // Marcador del niño
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(child.lat, child.lng),
                      child: PulsingMarker(isInArea: child.isInArea),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Info y estadísticas
          Expanded(
            flex: 1,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  StatusCard(isInArea: child.isInArea, lastUpdate: child.lastSeen),
                  SizedBox(height: 16),
                  StatsRow(
                    battery: child.batteryLevel,
                    distance: stats.totalDistanceKm,
                    timeInArea: stats.timeInAreaMinutes,
                  ),
                  SizedBox(height: 16),
                  HistoryButton(onPressed: () => _showHistory()),
                  SizedBox(height: 16),
                  RecentAlertsList(alerts: recentAlerts),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 5️⃣ Historial de Ruta (por día)

### Layout
```
┌─────────────────────────────┐
│ ← Historial          📅    │
│   Matias Jimenez            │
├─────────────────────────────┤
│                             │
│  📅 6 Dic 2025    [< >]     │
│                             │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │    🗺️ MAPA CON RUTA     │ │
│ │                         │ │
│ │  ●━━━●━━━●━━━●━━━▶     │ │
│ │ 🏫                📍    │ │
│ │                         │ │
│ │ [▶️ Reproducir ruta]     │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│  📊 Estadísticas del día    │
│ ┌───────┬───────┬─────────┐ │
│ │ 156   │ 2.4km │ 5h 30m  │ │
│ │puntos │recorr.│ en área │ │
│ └───────┴───────┴─────────┘ │
├─────────────────────────────┤
│  ⏱️ Timeline                │
│                             │
│  07:45 ●━━━━━━━━━━━━━━●    │
│  🟢                   12:35 │
│  Entrada              🔴    │
│                      Salió  │
│                             │
│  12:42 ●━━━━━━━━━━━━━━●    │
│  🟢                   14:28 │
│  Regresó              🔴    │
│                      Salida │
│                             │
├─────────────────────────────┤
│  📋 Eventos (4)             │
│  ├─ 🟢 07:45 Entró          │
│  ├─ 🔴 12:35 Salió          │
│  ├─ 🟢 12:42 Regresó        │
│  └─ 🔴 14:28 Salió (fin)    │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class HistoryScreen extends StatefulWidget {
  final int childId;
  
  @override
  _HistoryScreenState createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  DateTime selectedDate = DateTime.now();
  bool isAnimating = false;
  int currentRouteIndex = 0;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Historial'),
            Text(child.fullName, style: TextStyle(fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.calendar_today),
            onPressed: () => _showDatePicker(),
          ),
        ],
      ),
      body: FutureBuilder<RouteData>(
        future: api.getChildRoute(widget.childId, selectedDate),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return LoadingWidget();
          
          final routeData = snapshot.data!;
          
          return Column(
            children: [
              // Selector de fecha
              DateSelector(
                date: selectedDate,
                onPrevious: () => _changeDate(-1),
                onNext: () => _changeDate(1),
              ),
              
              // Mapa con ruta
              Expanded(
                child: Stack(
                  children: [
                    RouteMap(
                      route: routeData.route,
                      geofence: schoolGeofence,
                      animationIndex: isAnimating ? currentRouteIndex : null,
                    ),
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: PlayRouteButton(
                        isPlaying: isAnimating,
                        onPressed: () => _toggleAnimation(),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Estadísticas
              StatsCard(stats: routeData.stats),
              
              // Timeline
              TimelineWidget(events: routeData.events),
              
              // Lista de eventos
              EventsList(events: routeData.events),
            ],
          );
        },
      ),
    );
  }
  
  void _toggleAnimation() {
    if (isAnimating) {
      setState(() => isAnimating = false);
    } else {
      setState(() {
        isAnimating = true;
        currentRouteIndex = 0;
      });
      _animateRoute();
    }
  }
  
  void _animateRoute() async {
    for (int i = 0; i < route.length && isAnimating; i++) {
      setState(() => currentRouteIndex = i);
      await Future.delayed(Duration(milliseconds: 100));
    }
    setState(() => isAnimating = false);
  }
}
```

---

## 6️⃣ Alertas

### Layout
```
┌─────────────────────────────┐
│  🔔 Alertas                 │
├─────────────────────────────┤
│                             │
│  Hoy, 6 Dic                 │
│  ─────────────────────────  │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔴 Matias Jimenez       │ │
│ │    Salió del área       │ │
│ │    14:25 • Sin leer     │ │
│ │              [Ver mapa] │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🟢 Matias Jimenez       │ │
│ │    Entró al área        │ │
│ │    12:42 • Leída        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔴 Matias Jimenez       │ │
│ │    Salió del área       │ │
│ │    12:35 • Leída        │ │
│ └─────────────────────────┘ │
│                             │
│  Ayer, 5 Dic                │
│  ─────────────────────────  │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔴 Sofia Jimenez        │ │
│ │    Salió del área       │ │
│ │    14:30 • Leída        │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│  🏠    📍    🔔    👤      │
│ Home  Mapa  Alertas Perfil  │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class AlertsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Alertas'),
        actions: [
          TextButton(
            child: Text('Marcar todas'),
            onPressed: () => _markAllAsRead(),
          ),
        ],
      ),
      body: FutureBuilder<List<Alert>>(
        future: api.getMyAlerts(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return LoadingWidget();
          
          final alerts = snapshot.data!;
          final groupedAlerts = _groupByDate(alerts);
          
          return ListView.builder(
            itemCount: groupedAlerts.length,
            itemBuilder: (context, index) {
              final group = groupedAlerts[index];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Fecha header
                  Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      group.dateLabel,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                  
                  // Alertas del día
                  ...group.alerts.map((alert) => AlertCard(
                    alert: alert,
                    onTap: () => _showAlertDetail(alert),
                  )),
                ],
              );
            },
          );
        },
      ),
      bottomNavigationBar: BottomNavBar(currentIndex: 2),
    );
  }
}

class AlertCard extends StatelessWidget {
  final Alert alert;
  
  @override
  Widget build(BuildContext context) {
    final isExit = alert.type == 'EXIT_AREA';
    
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isExit ? Colors.red[100] : Colors.green[100],
          child: Icon(
            isExit ? Icons.logout : Icons.login,
            color: isExit ? Colors.red : Colors.green,
          ),
        ),
        title: Text(alert.childName),
        subtitle: Text(
          '${isExit ? "Salió del área" : "Entró al área"}\n'
          '${formatTime(alert.createdAt)} • ${alert.isRead ? "Leída" : "Sin leer"}',
        ),
        trailing: !alert.isRead 
          ? Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
            )
          : null,
        onTap: onTap,
      ),
    );
  }
}
```

---

## 7️⃣ Generar QR para Hijo

### Layout
```
┌─────────────────────────────┐
│ ← Código QR                 │
├─────────────────────────────┤
│                             │
│  Vincular dispositivo a:    │
│                             │
│  👦 Matias Jimenez          │
│  2do A Secundaria           │
│                             │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    ▄▄▄▄▄▄▄▄▄▄▄▄▄     │  │
│  │    █ ▄▄▄▄▄ █▀█ █     │  │
│  │    █ █   █ █▄▀▄█     │  │
│  │    █ █▄▄▄█ █ ▀▄█     │  │
│  │    █▄▄▄▄▄▄▄█▄█▄█     │  │
│  │    ▀▀▀▀▀▀▀▀▀▀▀▀▀     │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│                             │
│  📱 Instrucciones:          │
│                             │
│  1. Abre la app en el       │
│     dispositivo del niño    │
│                             │
│  2. Selecciona "Modo Hijo"  │
│                             │
│  3. Escanea este código QR  │
│                             │
│  4. ¡Listo! El dispositivo  │
│     comenzará a rastrear    │
│                             │
├─────────────────────────────┤
│  [ Compartir QR ]           │
│  [ Descargar imagen ]       │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class GenerateQRScreen extends StatelessWidget {
  final ChildModel child;
  
  @override
  Widget build(BuildContext context) {
    // Datos que contendrá el QR
    final qrData = jsonEncode({
      'childId': child.id,
      'schoolId': child.schoolId,
    });
    
    return Scaffold(
      appBar: AppBar(title: Text('Código QR')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            // Info del niño
            ChildInfoHeader(child: child),
            
            SizedBox(height: 32),
            
            // QR Code
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(blurRadius: 10, color: Colors.black12)],
              ),
              child: QrImageView(
                data: qrData,
                version: QrVersions.auto,
                size: 200,
              ),
            ),
            
            SizedBox(height: 32),
            
            // Instrucciones
            InstructionsWidget(),
            
            Spacer(),
            
            // Botones
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: Icon(Icons.share),
                    label: Text('Compartir'),
                    onPressed: () => _shareQR(),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: Icon(Icons.download),
                    label: Text('Guardar'),
                    onPressed: () => _saveQR(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

---

# 👦 MODO HIJO

## 8️⃣ Escanear QR

### Layout
```
┌─────────────────────────────┐
│ ← Escanear QR               │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │                       │  │
│  │    📷 CÁMARA          │  │
│  │                       │  │
│  │    ┌─────────────┐    │  │
│  │    │             │    │  │
│  │    │   ESCANEAR  │    │  │
│  │    │     AQUÍ    │    │  │
│  │    │             │    │  │
│  │    └─────────────┘    │  │
│  │                       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│                             │
│  Apunta la cámara al código │
│  QR generado por el padre   │
│                             │
│  💡 El QR debe estar bien   │
│     iluminado               │
│                             │
└─────────────────────────────┘
```

---

## 9️⃣ Modo Hijo Activo

### Layout
```
┌─────────────────────────────┐
│       MODO RASTREADOR       │
├─────────────────────────────┤
│                             │
│           🛡️               │
│                             │
│      RASTREANDO ACTIVO      │
│                             │
│  ┌───────────────────────┐  │
│  │        ┌────┐         │  │
│  │        │ 👦 │         │  │
│  │        └────┘         │  │
│  │   Matias Jimenez      │  │
│  │   2do A Secundaria    │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│                             │
│  📍 Enviando ubicación      │
│     cada 30 segundos        │
│                             │
│  🔋 Batería: 78%            │
│                             │
│  📶 Última sync: 14:25:30   │
│                             │
│  ✅ Estado: Conectado       │
│                             │
├─────────────────────────────┤
│                             │
│     ╭─────────────────╮     │
│     │ DETENER RASTREO │     │
│     ╰─────────────────╯     │
│                             │
│  ⚠️ Solo el padre puede      │
│     desvincular el          │
│     dispositivo             │
│                             │
└─────────────────────────────┘
```

### Flutter Widget
```dart
class ChildModeActiveScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              // Header
              Text(
                'MODO RASTREADOR',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[600],
                ),
              ),
              
              SizedBox(height: 32),
              
              // Icono grande animado
              PulsingIcon(
                icon: Icons.shield,
                color: Colors.green,
                size: 80,
              ),
              
              SizedBox(height: 16),
              
              Text(
                'RASTREANDO ACTIVO',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
              
              SizedBox(height: 32),
              
              // Card con info del niño
              ChildInfoCard(
                name: childName,
                grade: childGrade,
              ),
              
              SizedBox(height: 32),
              
              // Estado del tracking
              StatusInfoList(
                items: [
                  StatusItem(
                    icon: Icons.location_on,
                    label: 'Enviando ubicación cada 30 seg',
                  ),
                  StatusItem(
                    icon: Icons.battery_charging_full,
                    label: 'Batería: ${batteryLevel}%',
                  ),
                  StatusItem(
                    icon: Icons.sync,
                    label: 'Última sync: ${lastSync}',
                  ),
                  StatusItem(
                    icon: Icons.check_circle,
                    label: 'Estado: Conectado',
                    color: Colors.green,
                  ),
                ],
              ),
              
              Spacer(),
              
              // Botón de detener (opcional)
              OutlinedButton(
                child: Text('DETENER RASTREO'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                ),
                onPressed: () => _confirmStop(),
              ),
              
              SizedBox(height: 8),
              
              Text(
                '⚠️ Solo el padre puede desvincular el dispositivo',
                style: TextStyle(fontSize: 12, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🎨 Sistema de Diseño Mobile

### Colores
```dart
class AppColors {
  // Primarios
  static const primary = Color(0xFF3B82F6);      // Azul
  static const primaryDark = Color(0xFF1D4ED8);
  
  // Estados
  static const success = Color(0xFF10B981);      // Verde
  static const danger = Color(0xFFEF4444);       // Rojo
  static const warning = Color(0xFFF59E0B);      // Naranja
  
  // Neutros
  static const background = Color(0xFFF9FAFB);
  static const surface = Colors.white;
  static const textPrimary = Color(0xFF111827);
  static const textSecondary = Color(0xFF6B7280);
}
```

### Tipografía
```dart
class AppTextStyles {
  static const h1 = TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
  static const h2 = TextStyle(fontSize: 20, fontWeight: FontWeight.w600);
  static const h3 = TextStyle(fontSize: 18, fontWeight: FontWeight.w600);
  static const body = TextStyle(fontSize: 14);
  static const caption = TextStyle(fontSize: 12, color: AppColors.textSecondary);
}
```

### Componentes Base
```dart
// Botón primario
class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          padding: EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(text, style: TextStyle(fontSize: 16)),
      ),
    );
  }
}

// Badge de estado
class StatusBadge extends StatelessWidget {
  final bool isInArea;
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isInArea ? Colors.green[100] : Colors.red[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isInArea ? Icons.check_circle : Icons.warning,
            size: 14,
            color: isInArea ? Colors.green : Colors.red,
          ),
          SizedBox(width: 4),
          Text(
            isInArea ? 'En área' : 'Fuera',
            style: TextStyle(
              fontSize: 12,
              color: isInArea ? Colors.green[700] : Colors.red[700],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 📦 Dependencias Recomendadas

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & Estado
  dio: ^5.x
  flutter_riverpod: ^2.x
  
  # Mapas
  flutter_map: ^6.x
  latlong2: ^0.9.x
  
  # QR
  qr_flutter: ^4.x
  mobile_scanner: ^3.x
  
  # Ubicación
  geolocator: ^10.x
  
  # Local Storage
  shared_preferences: ^2.x
  flutter_secure_storage: ^9.x
  
  # UI
  google_fonts: ^6.x
  flutter_svg: ^2.x
  shimmer: ^3.x
  
  # Notificaciones
  firebase_core: ^2.x
  firebase_messaging: ^14.x
  flutter_local_notifications: ^16.x
  
  # Utilidades
  intl: ^0.18.x
  timeago: ^3.x
```

---

## 📁 Estructura de Carpetas

```
lib/
├── core/
│   ├── api/
│   │   └── api_client.dart
│   ├── theme/
│   │   ├── app_colors.dart
│   │   └── app_theme.dart
│   ├── constants/
│   │   └── api_constants.dart
│   └── utils/
│       └── formatters.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository.dart
│   │   └── presentation/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── home/
│   │   ├── data/
│   │   │   └── children_repository.dart
│   │   └── presentation/
│   │       ├── home_screen.dart
│   │       └── widgets/
│   │           └── child_card.dart
│   ├── child_detail/
│   │   └── presentation/
│   │       ├── child_detail_screen.dart
│   │       └── widgets/
│   │           ├── route_map.dart
│   │           └── stats_card.dart
│   ├── history/
│   │   └── presentation/
│   │       ├── history_screen.dart
│   │       └── widgets/
│   │           └── timeline_widget.dart
│   ├── alerts/
│   │   └── presentation/
│   │       ├── alerts_screen.dart
│   │       └── widgets/
│   │           └── alert_card.dart
│   ├── child_mode/
│   │   ├── data/
│   │   │   └── tracking_service.dart
│   │   └── presentation/
│   │       ├── qr_scanner_screen.dart
│   │       └── child_mode_active_screen.dart
│   └── profile/
│       └── presentation/
│           └── profile_screen.dart
├── shared/
│   └── widgets/
│       ├── primary_button.dart
│       ├── status_badge.dart
│       ├── battery_indicator.dart
│       └── bottom_nav_bar.dart
└── main.dart
```

---

## 🔌 Integración con Backend

### API Endpoints Utilizados

```dart
// Auth
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

// Children
GET  /api/children/my-children
GET  /api/children/:id

// Tracking
POST /api/tracking/positions          // Público - modo hijo
GET  /api/tracking/child/:id/last
GET  /api/tracking/child/:id/route?date=2025-12-06
GET  /api/tracking/child/:id/stats?period=day

// Alerts
GET  /api/alerts/my-alerts
GET  /api/alerts/unread-count
PATCH /api/alerts/:id/mark-read

// Devices
POST /api/devices/pair               // Público - modo hijo
```
