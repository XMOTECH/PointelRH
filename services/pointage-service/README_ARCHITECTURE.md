# 📋 Architecture - Pointage Service

## 📝 Vue d'Ensemble

Le **Pointage Service** gère les opérations de pointage (clock-in/clock-out) des employés.

### Responsabilités
- Traiter les pointages d'entrée et sortie
- Calculer les retards et heures supplémentaires  
- Valider les règles métier
- Publier les événements RabbitMQ
- Générer les logs métier

---

## 📁 Structure

```
app/
├── Http/Controllers/Api/
│   ├── BaseApiController.php        ← Classe mère
│   ├── ClockInController.php        ← Pointage d'entrée
│   └── ClockOutController.php       ← Pointage de sortie
├── Services/
│   ├── ClockInService.php           ← Logique métier entrée
│   ├── ClockOutService.php          ← Logique métier sortie
│   ├── LoggingService.php           ← Logs centralisés
│   ├── DriverResolver.php           ← Résolution driver (QR, NFC, etc)
│   ├── EventPublisher.php           ← Publication d'événements
│   └── DTOs/
│       └── ClockInData.php          ← DTO pointage
├── Repositories/
│   └── AttendanceRepository.php     ← Accès données
├── Exceptions/
│   ├── AlreadyClockedInException.php
│   ├── AttendanceNotFoundException.php
│   ├── NotAWorkDayException.php
│   ├── InvalidTokenException.php
│   └── ...
├── Models/
│   └── Attendance.php               ← Modèle présence
└── Events/
    ├── EmployeeCheckedIn.php
    ├── LateArrivalDetected.php
    └── EmployeeCheckedOut.php
```

---

## 🔄 Flux de Pointage

### Clock-In
```
1. Réception requête avec QR/NFC token
2. Validation du request (ClockInRequest)
3. Création DTO (ClockInData)
4. Appel ClockInService
   ├─ Résolution employé via Driver
   ├─ Vérification pointage unique (aujourd'hui)
   ├─ Vérification jour travail
   ├─ Calcul retard (domaine pur)
   ├─ Persistance en BD
   └─ Publication d'événements
5. Réponse formatée via respondSuccess
6. Logging info/warning/error
```

### Clock-Out
```
1. Réception requête avec employee_id
2. Validation du request
3. Appel ClockOutService
   ├─ Récupération pointage (sans sortie)
   ├─ Calcul durée travail
   ├─ Calcul heures supplémentaires
   ├─ Persistance
   └─ Publication d'événements
4. Réponse formatée
5. Logging
```

---

## 🔌 Endpoints API

### POST /api/attendances/clock-in
**Pointage d'entrée**

```bash
curl -X POST http://localhost:8001/api/attendances/clock-in \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "qr",
    "payload": {
      "qr_data": "encoded_qr_data"
    }
  }'
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_id": "uuid",
    "checked_in_at": "2026-03-20T08:15:00Z",
    "late_minutes": 15,
    "status": "LATE"
  },
  "message": "Pointage enregistré — retard: 15 min"
}
```

**Erreurs:**
- `409 Conflict` - Déjà pointé aujourd'hui
- `404 Not Found` - QR invalide
- `422 Unprocessable Entity` - Pas un jour de travail
- `500 Internal Server Error` - Erreur serveur

### POST /api/attendances/clock-out
**Pointage de sortie**

```bash
curl -X POST http://localhost:8001/api/attendances/clock-out \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_id": "uuid",
    "work_minutes": 495,
    "overtime_minutes": 15
  },
  "message": "Pointage de sortie enregistré"
}
```

---

## 🎯 Patterns Clés

### 1. Service Method
```php
/**
 * Traiter pointage d'entrée
 * 
 * @throws AlreadyClockedInException
 * @throws NotAWorkDayException
 */
public function clockIn(ClockInData $data): Attendance
{
    // Étape 1: Résoudre employé
    $driver = $this->driverResolver->resolve($data->channel);
    $employee = $driver->resolve($data->payload, $data->companyId);
    
    // Étape 2: Vérifier règles métier
    if ($this->attendances->existsForToday($employee->id)) {
        throw new AlreadyClockedInException(...);
    }
    
    // Étape 3: Calculer (domaine pur)
    $lateMinutes = LateMatcher::calculate(...);
    
    // Étape 4: Persister
    $attendance = $this->attendances->create([...]);
    
    // Étape 5: Publier événements
    $this->publisher->publish(new EmployeeCheckedIn(...));
    
    return $attendance;
}
```

### 2. Controller Stack Handling
```php
public function store(ClockInRequest $request): JsonResponse
{
    try {
        $attendance = $this->clockInService->clockIn(
            new ClockInData(
                channel:   $request->validated('channel', 'qr'),
                payload:   $request->validated('payload', []),
                companyId: $request->auth_company_id,
            )
        );
        
        LoggingService::info('Clock-in successful', [
            'employee_id' => $attendance->employee_id,
        ]);
        
        return $this->respondSuccess(
            new AttendanceResource($attendance),
            ...,
            201
        );
        
    } catch (AlreadyClockedInException $e) {
        LoggingService::warning('Clock-in failed: already clocked in', [...]);
        return $this->respondConflict($e->getMessage());
    } catch (\Exception $e) {
        LoggingService::error('Clock-in error', $e);
        return $this->respondServerError(...);
    }
}
```

### 3. Domain Logic (Pure)
```php
// LateMatcher.php - Pas de side effects
class LateMatcher
{
    public static function calculate(
        Carbon $clockIn,
        string $startTime,
        int $graceMinutes,
        string $timezone
    ): int {
        $startAt = Carbon::createFromFormat(
            'H:i:s', 
            $startTime, 
            $timezone
        );
        
        $diff = $clockIn->diffInMinutes($startAt);
        return max(0, $diff - $graceMinutes);
    }
}
```

---

## 🧪 Testing

### Service Tests
```php
class ClockInServiceTest extends TestCase
{
    public function test_clockin_success()
    {
        $employee = Employee::factory()->create();
        $data = new ClockInData(
            channel: 'qr',
            payload: [...],
            companyId: $employee->company_id,
        );
        
        $attendance = $this->service->clockIn($data);
        
        $this->assertEquals($employee->id, $attendance->employee_id);
        $this->assertNotNull($attendance->checked_in_at);
    }
    
    public function test_clockin_fails_already_clocked()
    {
        Attendance::factory()->create([
            'employee_id' => $employee->id,
            'work_date' => today(),
        ]);
        
        $this->expectException(AlreadyClockedInException::class);
        $this->service->clockIn($data);
    }
}
```

### API Tests
```php
class ClockInApiTest extends TestCase
{
    public function test_clockin_endpoint()
    {
        $response = $this->post('/api/attendances/clock-in', [
            'channel' => 'qr',
            'payload' => ['qr_data' => '...'],
        ]);
        
        $response->assertStatus(201);
        $response->assertJsonPath('data.checked_in_at', ...);
    }
}
```

---

## 📊 Modèle de Données

### Attendance
```sql
CREATE TABLE attendances (
    id UUID PRIMARY KEY,
    employee_id UUID,
    company_id UUID,
    department_id UUID,
    channel VARCHAR(50),           -- 'qr', 'nfc', 'mobile'
    checked_in_at TIMESTAMP,
    checked_out_at TIMESTAMP,
    work_date DATE,
    work_minutes INT,
    late_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    status VARCHAR(20),            -- 'PRESENT', 'LATE', 'ABSENT'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔐 Sécurité

✅ Validation stricte des inputs
✅ Autorisation par company_id
✅ Pas de requêtes SQL directes
✅ Logs de toutes les actions
✅ Gestion d'erreurs cohérente

---

## 🚀 Dépendances

- Laravel 10+
- PHP 8.2+
- RabbitMQ (pour événements)
- PostgreSQL/MySQL
- Redis (pour caching optionnel)

---

## 📞 Support

Pour toute question sur l'architecture, consultez:
- [REFACTORING_GUIDE.md](../REFACTORING_GUIDE.md)
- [BEST_PRACTICES.md](../BEST_PRACTICES.md)
- [REFACTORING_COMPLETED.md](../REFACTORING_COMPLETED.md)
