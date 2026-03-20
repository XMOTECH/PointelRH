## 📋 Attendance (Pointage) Service Architecture

Cette documentation décrit l'architecture refactorisée du service Attendance.

### 📂 Structure

```
app/
├── Http/
│   └── Controllers/Api/
│       ├── BaseApiController.php       ← Contrôleur de base
│       ├── ClockInController.php       ← Pointage entrée
│       └── ClockOutController.php      ← Pointage sortie
├── Services/
│   ├── ClockInService.php              ← Logique métier entrée
│   ├── ClockOutService.php             ← Logique métier sortie
│   ├── DriverResolver.php              ← Résolution des drivers
│   ├── LoggingService.php              ← Logs centralisés
│   ├── Drivers/
│   │   ├── QRCodeDriver.php
│   │   ├── FaceRecognitionDriver.php
│   │   └── BiometricDriver.php
│   └── DTOs/
│       └── ClockInData.php
├── Repositories/
│   └── AttendanceRepository.php
├── Exceptions/
│   ├── BaseApiException.php
│   ├── AlreadyClockedInException.php
│   ├── AttendanceNotFoundException.php
│   ├── InvalidTokenException.php
│   ├── NotAWorkDayException.php
│   └── NotClockedInException.php
├── Domain/
│   └── LateMatcher.php                 ← Logique métier pure
└── Events/
    ├── EmployeeCheckedIn.php
    ├── EmployeeCheckedOut.php
    └── LateArrivalDetected.php
```

### 🔄 Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/attendances/clock-in` | POST | Enregistrer une entrée |
| `/api/attendances/clock-out` | POST | Enregistrer une sortie |

### ✅ Contrôleurs Refactorisés

| Contrôleur | Statut | Détails |
|-----------|--------|---------|
| ClockInController | ✅ | Pointage entrée refactorisé |
| ClockOutController | ✅ | Pointage sortie refactorisé |

### 🔌 Multi-Drivers Support

Le service supporte plusieurs types de vérification:
- **QR Code** - Via app mobile
- **Face Recognition** - Via reconnaissance faciale
- **Biometric** - Via empreinte digitale

### 📊 Flux Pointage Entrée (Clock-In)

1. Validation du payload et channel
2. Résolution de l'employé via le driver
3. Vérification de l'unicité (un seul pointage/jour)
4. Vérification du jour de travail
5. Calcul du retard
6. Persistance de l'enregistrement
7. Publication des événements (EmployeeCheckedIn, LateArrivalDetected)

### 📊 Examples

#### Clock-In via QR Code
```json
POST /api/attendances/clock-in
{
  "channel": "qr",
  "payload": {
    "qr_data": "..."
  }
}
```

#### Clock-Out
```json
POST /api/attendances/clock-out
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "employee_id": "xxx",
    "checked_in_at": "2026-03-20T08:30:00Z",
    "checked_out_at": "2026-03-20T17:00:00Z",
    "late_minutes": 15,
    "status": "late"
  }
}
```
