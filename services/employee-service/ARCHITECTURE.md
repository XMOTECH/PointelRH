## 📋 Employee Service Architecture

Cette documentation décrit l'architecture refactorisée du service Employee.

### 📂 Structure

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── BaseApiController.php       ← Contrôleur de base
│   │   ├── EmployeeController.php      ← CRUD des employés
│   │   ├── DepartmentController.php    ← CRUD des départements
│   │   ├── ScheduleController.php      ← CRUD des horaires
│   │   └── EmployeeNotificationController.php ← Contexte notifications
│   └── Requests/
│       ├── StoreEmployeeRequest.php
│       ├── UpdateEmployeeRequest.php
│       ├── StoreDepartmentRequest.php
│       ├── UpdateDepartmentRequest.php
│       ├── StoreScheduleRequest.php
│       └── UpdateScheduleRequest.php
├── Services/
│   ├── EmployeeService.php             ← Logique métier employés
│   ├── DepartmentService.php           ← Logique métier départements
│   ├── ScheduleService.php             ← Logique métier horaires
│   ├── LoggingService.php              ← Logs centralisés
│   └── DTOs/
│       ├── EmployeeData.php
│       ├── DepartmentData.php
│       └── ScheduleData.php
├── Repositories/
│   ├── EmployeeRepository.php
│   ├── DepartmentRepository.php
│   └── ScheduleRepository.php
├── Exceptions/
│   ├── BaseApiException.php            ← Classe de base
│   ├── ResourceNotFoundException.php
│   ├── InvalidDataException.php
│   ├── UnauthorizedException.php
│   ├── ForbiddenException.php
│   └── ConflictException.php
└── Models/
    ├── Employee.php
    ├── Department.php
    └── Schedule.php
```

### 🔄 Flux de Requête

1. **Request** → Validées par `StoreEmployeeRequest` / `UpdateEmployeeRequest`
2. **Controller** → Hérite de `BaseApiController`, appelle le Service
3. **Service** → Logique métier pure, peut lever des `BaseApiException`
4. **Repository** → Accès aux données
5. **Response** → Formatée par `respondSuccess()` ou `respondError()`

### ✅ Contrôleurs Refactorisés

| Contrôleur | Statut | Détails |
|-----------|--------|---------|
| EmployeeController | ✅ | CRUD complet, validation, logging |
| DepartmentController | ✅ | CRUD complet, validation, logging |
| ScheduleController | ✅ | CRUD complet, validation, logging |
| EmployeeNotificationController | ✅ | Récupère contexte notifications |

### 📋 Checklist de Référence

- ✅ Hériter de `BaseApiController`
- ✅ Utiliser `respondSuccess()` et `respondError()`
- ✅ Lever des `BaseApiException` dans les Services
- ✅ Utiliser `LoggingService` pour les traces
- ✅ Valider les données avec Request classes
- ✅ Documenter les méthodes en PHPDoc
- ✅ Ajouter les types stricts

### 📚 Exemples d'Utilisation

#### Créer un employé

```php
// Controller
public function store(StoreEmployeeRequest $request): JsonResponse
{
    try {
        $employee = $this->employeeService->create($request->validated());
        LoggingService::info('Employee created', ['id' => $employee->id]);
        return $this->respondSuccess(new EmployeeResource($employee), 'Created', 201);
    } catch (InvalidDataException $e) {
        return $this->respondError($e->getMessage(), 422);
    }
}

// Service
public function create(array $data): Employee
{
    $employee = Employee::create($data);
    return $employee;
}
```

#### Retrieving with Filters

```php
// En URL: GET /api/employees?department_id=xxx&status=active

public function index(Request $request): JsonResponse
{
    $employees = Employee::where('company_id', $request->auth_company_id)
        ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
        ->when($request->status, fn($q) => $q->where('status', $request->status))
        ->paginate();
    
    return $this->respondSuccess(new EmployeeCollection($employees));
}
```
