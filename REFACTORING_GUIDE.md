# 📋 Guide de Refactorisation des Services

## Objectif
Standardiser le code dans tous les services pour maintenir cohérence, propreté et maintenabilité.

---

## ✅ Checklist de Refactorisation

### 1. **Controllers**
- [ ] Hériter de `BaseApiController` au lieu de `Controller`
- [ ] Utiliser `$this->respondSuccess()` au lieu de `response()->json()`
- [ ] Utiliser `$this->respondError()` pour les erreurs
- [ ] Utiliser `$this->respondUnauthorized()`, `respondForbidden()`, `respondNotFound()`, etc.
- [ ] Supprimer tous les `Log::debug()` et logs de performance
- [ ] Utiliser `LoggingService` pour les logs métier uniquement

### 2. **Services**
- [ ] Ne doit contenir QUE la logique métier
- [ ] Ne doit PAS faire de `response()->json()`
- [ ] Doit lever des exceptions custom pour les erreurs métier
- [ ] Doit documenter les paramètres et retours
- [ ] Exemple bon pattern:
  ```php
  /**
   * Process employee clock in
   * @throws AlreadyClockedInException
   * @throws NotAWorkDayException
   */
  public function clockIn(ClockInData $data): Attendance
  {
      // Logique métier ici
      // Pas de try-catch pour les erreurs de présentation
  }
  ```

### 3. **DTOs (Data Transfer Objects)**
- [ ] Utiliser des propriétés publiques ou constructeur
- [ ] Ajouter des types stricts
- [ ] Exemple:
  ```php
  class ClockInData
  {
      public function __construct(
          public readonly string $channel,
          public readonly array $payload,
          public readonly string $companyId,
      ) {}
  }
  ```

### 4. **Exceptions**
- [ ] Créer une classe pour chaque exception métier
- [ ] Hériter de `BaseApiException`
- [ ] Exemple:
  ```php
  class AlreadyClockedInException extends BaseApiException
  {
      protected int $statusCode = 409;
  }
  ```

### 5. **Models & Repositories**
- [ ] Utiliser Repository Pattern pour l'accès aux données
- [ ] Ajouter des scopes utiles
- [ ] Exemple de bon pattern:
  ```php
  class AttendanceRepository
  {
      public function existsForToday(string $employeeId): bool
      {
          return Attendance::where('employee_id', $employeeId)
              ->whereDate('created_at', today())
              ->exists();
      }
  }
  ```

### 6. **Routes**
- [ ] Grouper par domaine métier
- [ ] Documenter les middleware appliqués
- [ ] Exemple:
  ```php
  Route::middleware(['auth:api', 'verified'])->group(function () {
      Route::apiResource('attendances', AttendanceController::class);
  });
  ```

### 7. **Logging**
- [ ] Utiliser `LoggingService::info()` pour les actions métier
- [ ] Utiliser `LoggingService::warning()` pour les anomalies
- [ ] Utiliser `LoggingService::error()` pour les erreurs
- [ ] Jamais de `Log::debug()` ou logs de timing

---

## 🔧 Exemple Complet

### ❌ AVANT (Code Sale)
```php
class EmployeeController extends Controller
{
    public function store(Request $request)
    {
        try {
            $start = microtime(true);
            Log::debug('Creating employee...');
            
            $data = $request->validate([...]);
            $employee = Employee::create($data);
            
            Log::debug('Employee created', ['time' => microtime(true) - $start]);
            
            return response()->json([
                'success' => true,
                'data' => new EmployeeResource($employee)
            ]);
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```

### ✅ APRÈS (Code Propre)
```php
class EmployeeController extends BaseApiController
{
    public function __construct(
        private readonly EmployeeService $employeeService
    ) {}
    
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            $employee = $this->employeeService->create($request->validated());
            
            LoggingService::info('Employee created', ['employee_id' => $employee->id]);
            
            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employee created successfully',
                201
            );
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid employee data', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee', $e);
            return $this->respondServerError();
        }
    }
}
```

---

## 📁 Structure Recommandée

```
app/
├── Http/
│   └── Controllers/
│       ├── Api/
│       │   ├── BaseApiController.php     ← Hérité par tous
│       │   ├── EmployeeController.php
│       │   └── DepartmentController.php
├── Services/
│   ├── LoggingService.php                ← Logs centralisés
│   ├── EmployeeService.php               ← Logique métier
│   └── DTOs/
│       └── EmployeeData.php
├── Exceptions/
│   ├── BaseApiException.php
│   └── InvalidDataException.php
└── Repositories/
    └── EmployeeRepository.php
```

---

## 🎯 Priorités de Refactorisation

1. **AuthService** ✅ DONE
   - Controllers
   - Services
   - Routes

2. **PointageService** ✅ DONE
   - ClockInController ✅
   - ClockOutController ✅
   - Services ✅

3. **EmployeeService** ✅ DONE
   - EmployeeController ✅
   - DepartmentController ✅
   - ScheduleController ✅
   - Services ✅

4. **NotificationService** ✅ DONE
   - NotificationController ✅
   - Services ✅

5. **AnalyticsService** ✅ DONE
   - AnalyticsController ✅
   - Services ✅

---

## 💡 Tips

- **Ne pas oublier**: Ajouter des types de retour à toutes les méthodes
- **Documentation**: Ajouter PHPDoc pour les services
- **Tests**: Créer des tests unitaires après refactorisation
- **Git**: Faire des commits par service refactorisé

