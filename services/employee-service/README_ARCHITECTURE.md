# 👥 Architecture - Employee Service

## 📝 Vue d'Ensemble

Le **Employee Service** gère :
- Les employés et informations personnelles
- Les départements et hiérarchies
- Les horaires de travail
- Les notifications contextuelles

### Responsabilités
- CRUD complet des employés
- Gestion des départements
- Configuration des horaires
- Contexte de notifications
- Logs métier centralisés

---

## 📁 Structure

```
app/
├── Http/Controllers/Api/
│   ├── BaseApiController.php              ← Classe mère
│   ├── EmployeeController.php             ← Gestion employés
│   ├── DepartmentController.php           ← Gestion départements
│   ├── ScheduleController.php             ← Gestion horaires
│   └── EmployeeNotificationController.php ← Contexte notifications
├── Services/
│   ├── EmployeeService.php                ← Logique employés
│   ├── DepartmentService.php              ← Logique départements
│   ├── ScheduleService.php                ← Logique horaires
│   ├── LoggingService.php                 ← Logs centralisés
│   └── DTOs/
│       └── EmployeeData.php               ← DTO employé
├── Repositories/
│   ├── EmployeeRepository.php
│   ├── DepartmentRepository.php
│   └── ScheduleRepository.php
├── Exceptions/
│   ├── ResourceNotFoundException.php
│   ├── InvalidDataException.php
│   └── ConflictException.php
├── Models/
│   ├── Employee.php
│   ├── Department.php
│   └── Schedule.php
└── Http/Requests/
    ├── StoreEmployeeRequest.php
    └── UpdateEmployeeRequest.php
```

---

## 🔄 Flux Métier

### Créer un Employé

```
Controller
  ├─ Validation (StoreEmployeeRequest)
  ├─ Appel Service.create()
  │   ├─ Validation métier
  │   ├─ Persistance
  │   ├─ Logging
  │   └─ Exception si erreur
  ├─ Logging success
  └─ Réponse 201
```

### Mettre à Jour un Employé

```
Controller
  ├─ Validation (UpdateEmployeeRequest)
  ├─ Appel Service.update()
  │   ├─ Récupération (exception si pas trouvé)
  │   ├─ Validation métier
  │   ├─ Update en BD
  │   ├─ Logging
  │   └─ Exception si erreur
  ├─ Logging success
  └─ Réponse 200
```

### Supprimer un Employé

```
Controller
  ├─ Appel Service.delete()
  │   ├─ Récupération (exception si pas trouvé)
  │   ├─ Suppression
  │   ├─ Logging
  │   └─ Exception si erreur
  ├─ Logging success
  └─ Réponse 200
```

---

## 🔌 Endpoints API

### Employees

**GET /api/employees** - Lister
```bash
curl "http://localhost:8002/api/employees?department_id=uuid&status=active&contract_type=CDI"
```

**POST /api/employees** - Créer
```bash
curl -X POST http://localhost:8002/api/employees \
  -H "Authorization: Bearer {token}" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@company.com",
    "phone": "221770000000",
    "department_id": "uuid",
    "schedule_id": "uuid",
    "contract_type": "CDI",
    "status": "active"
  }'
```

**GET /api/employees/{id}** - Détails
**PUT /api/employees/{id}** - Modifier
**DELETE /api/employees/{id}** - Supprimer

### Departments

**GET /api/departments** - Lister
**POST /api/departments** - Créer
**GET /api/departments/{id}** - Détails
**PUT /api/departments/{id}** - Modifier
**DELETE /api/departments/{id}** - Supprimer

### Schedules

**GET /api/schedules** - Lister
**POST /api/schedules** - Créer
**GET /api/schedules/{id}** - Détails
**PUT /api/schedules/{id}** - Modifier
**DELETE /api/schedules/{id}** - Supprimer

### Notifications Context

**GET /api/employees/{id}/notification-context** - Contexte
```json
{
  "employee_name": "Jean Dupont",
  "manager_id": "uuid",
  "manager_name": "Marie Martin",
  "manager_email": "marie@company.com",
  "manager_preferences": {
    "email_enabled": true,
    "whatsapp_enabled": true,
    "quiet_hours_start": "22:00:00",
    "quiet_hours_end": "06:00:00"
  }
}
```

---

## 🎯 Patterns Clés

### 1. Service Pattern

```php
class EmployeeService
{
    /**
     * Créer un nouvel employé
     *
     * @throws InvalidDataException
     */
    public function create(array $data): Employee
    {
        try {
            $employee = Employee::create($data);
            LoggingService::info('Employee created via service', [
                'employee_id' => $employee->id,
            ]);
            return $employee;
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee in service', $e);
            throw new InvalidDataException('Failed to create employee');
        }
    }

    /**
     * Récupérer par ID
     *
     * @throws ResourceNotFoundException
     */
    public function getById(string $id): Employee
    {
        $employee = Employee::find($id);
        if (!$employee) {
            throw new ResourceNotFoundException('Employee');
        }
        return $employee;
    }

    /**
     * Mettre à jour
     *
     * @throws ResourceNotFoundException
     * @throws InvalidDataException
     */
    public function update(string $id, array $data): Employee
    {
        try {
            $employee = $this->getById($id);
            $employee->update($data);
            
            LoggingService::info('Employee updated via service', [
                'employee_id' => $id,
                'changed_fields' => array_keys($data),
            ]);
            
            return $employee;
        } catch (\Exception $e) {
            LoggingService::error('Failed to update employee in service', $e);
            throw new InvalidDataException('Failed to update employee');
        }
    }

    /**
     * Supprimer
     *
     * @throws ResourceNotFoundException
     */
    public function delete(string $id): bool
    {
        $employee = $this->getById($id);
        $deleted = $employee->delete();
        
        if ($deleted) {
            LoggingService::info('Employee deleted via service', [
                'employee_id' => $id,
            ]);
        }
        
        return $deleted;
    }

    /**
     * Lister avec filtres
     */
    public function list(string $companyId, array $filters = []): Collection
    {
        $query = Employee::where('company_id', $companyId);

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get();
    }
}
```

### 2. Controller Pattern

```php
class EmployeeController extends BaseApiController
{
    public function __construct(
        private readonly EmployeeService $employeeService
    ) {}

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['company_id'] = $request->auth_company_id;

            $employee = $this->employeeService->create($data);

            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employé créé avec succès',
                201
            );
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when creating employee', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee', $e);
            return $this->respondServerError('Impossible de créer l\'employé');
        }
    }

    public function update(UpdateEmployeeRequest $request, string $id): JsonResponse
    {
        try {
            $employee = $this->employeeService->update($id, $request->validated());

            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employé mis à jour',
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Employee not found for update', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when updating employee', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to update employee', $e);
            return $this->respondServerError();
        }
    }
}
```

---

## 🧪 Testing

### Unit Tests (Services)
```php
class EmployeeServiceTest extends TestCase
{
    public function test_create_employee_success()
    {
        $data = [
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean@company.com',
        ];
        
        $employee = $this->service->create($data);
        
        $this->assertNotNull($employee->id);
        $this->assertEquals('Jean', $employee->first_name);
    }
    
    public function test_create_employee_fails()
    {
        $data = []; // Invalid
        
        $this->expectException(InvalidDataException::class);
        $this->service->create($data);
    }
}
```

### API Tests
```php
class EmployeeApiTest extends TestCase
{
    public function test_list_employees()
    {
        Employee::factory()->count(5)->create();
        
        $response = $this->get('/api/employees');
        
        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }
    
    public function test_create_employee()
    {
        $response = $this->post('/api/employees', [
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
        ]);
        
        $response->assertStatus(201);
    }
}
```

---

## 📊 Modèle de Données

### Employees
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    company_id UUID,
    department_id UUID,
    schedule_id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    contract_type VARCHAR(20),    -- 'CDI', 'CDD', 'STAGE'
    status VARCHAR(20),           -- 'active', 'inactive', 'suspended'
    qr_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Departments
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    company_id UUID,
    name VARCHAR(100),
    manager_id UUID,
    parent_id UUID,
    location VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Schedules
```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY,
    company_id UUID,
    name VARCHAR(100),
    work_days JSON,              -- ['Monday', 'Tuesday', ...]
    start_time TIME,
    end_time TIME,
    grace_minutes INT DEFAULT 0,
    timezone VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔐 Sécurité

✅ Autorisation par company_id sur toutes les requêtes
✅ Validation stricte des inputs
✅ Pas de queries SQL directes
✅ Logging de toutes les modifications
✅ DTOs typés pour les transferts

---

## 🚀 Dépendances

- Laravel 10+
- PHP 8.2+
- PostgreSQL/MySQL
- Redis (optionnel)

---

## 📞 Support

Consultez:
- [REFACTORING_GUIDE.md](../REFACTORING_GUIDE.md)
- [REFACTORING_COMPLETED.md](../REFACTORING_COMPLETED.md)
