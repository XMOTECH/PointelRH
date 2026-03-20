# 🏗️ Best Practices & Architecture Standards

Guide des bonnes pratiques pour maintenir la qualité du code PointelRH.

---

## 📋 Table des Matières

1. [Controllers & HTTP](#controllers--http)
2. [Services & Business Logic](#services--business-logic)
3. [Exceptions & Error Handling](#exceptions--error-handling)
4. [DTOs & Data Transfer](#dtos--data-transfer)
5. [Repositories & Data Access](#repositories--data-access)
6. [Validation & Requests](#validation--requests)
7. [Logging & Monitoring](#logging--monitoring)
8. [Frontend Standards](#frontend-standards)

---

## Controllers & HTTP

### ✅ Good Practice

```php
class EmployeeController extends BaseApiController
{
    public function __construct(
        private readonly EmployeeService $employeeService
    ) {}

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            // Données validées
            $employee = $this->employeeService->create($request->validated());
            
            // Log succès
            LoggingService::info('Employee created', ['id' => $employee->id]);
            
            // Réponse standardisée
            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employee created successfully',
                201
            );
        } catch (InvalidDataException $e) {
            LoggingService::warning('Validation failed', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee', $e);
            return $this->respondServerError();
        }
    }
}
```

### ❌ Bad Practice

```php
class EmployeeController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all(); // Dangerous!
        try {
            $employee = Employee::create($data); // Direct model access
            Log::debug('Employee created'); // Wrong log method
            return response()->json(['success' => true, 'data' => $employee]); // Not standardized
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500); // Wrong format
        }
    }
}
```

### 📝 Rules

- ✅ Hériter de `BaseApiController`
- ✅ Utiliser **Dependency Injection** pour les Services
- ✅ Valider les données avec des `FormRequest` classes
- ✅ Utiliser `respondSuccess()` et `respondError()`
- ✅ Logger avec `LoggingService`
- ✅ Wrapper les appels service dans try-catch
- ✅ Documenter en PHPDoc
- ✅ Retourner des Resources transformées

---

## Services & Business Logic

### ✅ Good Practice

```php
class DepartmentService
{
    public function create(array $data): Department
    {
        // Logique métier PURE
        if (empty($data['name'])) {
            throw new InvalidDataException('Name is required');
        }

        $department = Department::create($data);

        LoggingService::info('Department created', ['id' => $department->id]);

        return $department;
    }

    public function getById(string $id): Department
    {
        $department = Department::find($id);
        if (!$department) {
            throw new ResourceNotFoundException('Department');
        }
        return $department;
    }
}
```

### ❌ Bad Practice

```php
class DepartmentService
{
    public function create(array $data)
    {
        // Pas de validation des règles métier
        $department = Department::create($data);
        
        // Retour de réponse HTTP (appartient au Controller!)
        return response()->json(['success' => true, 'data' => $department]);
    }
}
```

### 📝 Rules

- ✅ Logique métier **pure**, pas de réponses HTTP
- ✅ Lever des `BaseApiException` pour les erreurs
- ✅ Utiliser des **DTOs** pour les paramètres
- ✅ Retourner des Models ou Collections
- ✅ Utiliser `LoggingService` pour les traces
- ✅ Ajouter des **PHPDoc** complets
- ✅ Avoir une seule responsabilité

---

## Exceptions & Error Handling

### ✅ Good Practice

```php
namespace App\Exceptions;

class InvalidDataException extends BaseApiException
{
    protected int $statusCode = 422;

    public function __construct(string $message = 'Invalid data')
    {
        parent::__construct($message);
    }
}

// Usage
throw new InvalidDataException('Email is already in use');
```

### ❌ Bad Practice

```php
// Jeter une Exception générique
throw new Exception('Something went wrong');

// Ou directement dans le controller
return response()->json(['error' => 'Something went wrong'], 500);
```

### 📝 Rules

- ✅ Créer une Exception pour **chaque domaine métier**
- ✅ Hériter de `BaseApiException`
- ✅ Définir le `statusCode` approprié
- ✅ Utiliser des messages clairs et informatifs
- ✅ Capturer dans le Controller avec try-catch

---

## DTOs & Data Transfer

### ✅ Good Practice

```php
namespace App\Services\DTOs;

readonly class EmployeeData
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $companyId,
        public ?string $jobTitle = null,
    ) {}
}

// Usage dans le Service
public function create(EmployeeData $data): Employee
{
    return Employee::create([
        'first_name' => $data->firstName,
        'last_name' => $data->lastName,
        'email' => $data->email,
        'company_id' => $data->companyId,
        'job_title' => $data->jobTitle,
    ]);
}
```

### ❌ Bad Practice

```php
// Passer un array partout
public function create(array $data): Employee
{
    // Quelle est la structure?
    // Quels champs sont optionnels?
    return Employee::create($data);
}
```

### 📝 Rules

- ✅ Utiliser `readonly` pour l'immutabilité
- ✅ Typer chaque propriété
- ✅ Utiliser le constructor promotion
- ✅ Documenter en PHPDoc
- ✅ Utiliser dans les Services

---

## Repositories & Data Access

### ✅ Good Practice

```php
class EmployeeRepository
{
    public function findById(string $id): ?Employee
    {
        return Employee::find($id);
    }

    public function findByEmail(string $email): ?Employee
    {
        return Employee::where('email', $email)->first();
    }

    public function findByCompanyId(string $companyId): Collection
    {
        return Employee::where('company_id', $companyId)->get();
    }

    public function create(array $data): Employee
    {
        return Employee::create($data);
    }
}

// Usage
$repository = new EmployeeRepository();
$employee = $repository->findById('xxx');
```

### ❌ Bad Practice

```php
// Queries directes dans le Service/Controller
$employee = Employee::where('id', $id)->first();

// Pas de réutilisabilité des queries
// Couplage serré avec le Model
```

### 📝 Rules

- ✅ Créer un Repository par Model majeur
- ✅ Centraliser les queries
- ✅ Utiliser depuis les Services
- ✅ Nommer les méthodes clairement (`findById`, `findByEmail`, etc.)
- ✅ Retourner des Models ou Collections

---

## Validation & Requests

### ✅ Good Practice

```php
class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'required|string|max:20',
            'department_id' => 'required|uuid',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already in use',
            'department_id.required' => 'Department is required',
        ];
    }
}

// Controller
public function store(StoreEmployeeRequest $request): JsonResponse
{
    // Données automatiquement validées
    $employee = $this->service->create($request->validated());
    return $this->respondSuccess($employee);
}
```

### ❌ Bad Practice

```php
// Valider dans le Controller
public function store(Request $request): JsonResponse
{
    $data = $request->validate([...]); // Validations mélangées au code
    // ...
}

// Ou pas de validation du tout
$data = $request->all();
Employee::create($data);
```

### 📝 Rules

- ✅ Créer une `FormRequest` classe pour chaque endpoint
- ✅ Définir les `rules()` de validation
- ✅ Ajouter des `messages()` personnalisés
- ✅ Utiliser `$request->validated()` dans le Controller
- ✅ Nommer clairement: `StoreXRequest`, `UpdateXRequest`

---

## Logging & Monitoring

### ✅ Good Practice

```php
// Création
LoggingService::info('Employee created', [
    'employee_id' => $employee->id,
    'email' => $employee->email,
    'created_by' => auth()->id(),
]);

// Avertissement
LoggingService::warning('Invalid employee data', [
    'reason' => 'Email already exists',
    'email' => $email,
]);

// Erreur
LoggingService::error('Failed to create employee', $exception);
```

### ❌ Bad Practice

```php
// Logs de debug partout
Log::debug('Creating employee');
Log::debug('Employee created at: ' . microtime());

// Info sans contexte
Log::info('Operation failed');

// Exposer des données sensibles
Log::info('User password: ' . $password);
```

### 📝 Rules

- ✅ Utiliser `LoggingService` (centralisé)
- ✅ 3 niveaux: `info()`, `warning()`, `error()`
- ✅ Inclure du contexte pertinent (IDs, emails masqués, changements)
- ✅ **Jamais** de logs de debug/timing
- ✅ **Jamais** de données sensibles

---

## Frontend Standards

### ✅ Good Practice

#### Component Structure
```typescript
// ✅ Composants découplés
export const ClockCard: React.FC<Props> = ({ time, onClockIn }) => (
  <div>
    <p>{time}</p>
    <button onClick={onClockIn}>Clock In</button>
  </div>
);

export const QRCodeCard: React.FC<Props> = ({ data, onGenerate }) => (
  <div>
    <QRCode value={data} />
    <button onClick={onGenerate}>Generate</button>
  </div>
);
```

#### Custom Hooks
```typescript
// ✅ Logique réutilisable
export const useRealTimeClock = () => {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return time;
};
```

#### Constants & Config
```typescript
// ✅ Centralisées
export const CLOCK_IN_MESSAGES = {
  success: 'Pointage enregistré',
  error: 'Erreur lors du pointage',
  retry: 'Réessayer',
};

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
};
```

### ❌ Bad Practice

```typescript
// Composants monolithiques
function ClockInPage() {
  const [time, setTime] = useState('');
  const [qr, setQr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 500 lignes de code...
  
  useEffect(() => {
    setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString()); // Format hardcodé
    }, 1000);
  }, []);
  
  // Messages en dur
  return <div>{error && 'Il y a une erreur'}</div>;
}
```

### 📝 Rules

- ✅ Composants **petits et découplés** (< 200 lignes)
- ✅ **Custom hooks** pour la logique réutilisable
- ✅ **Constants** centralisées
- ✅ **Props interfaces** bien typées
- ✅ Éviter les **états globaux** inutiles
- ✅ **Mocks** pour les api calls en dev

---

## 📚 Resources Complémentaires

- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Guide détaillé de refactoring
- [employee-service/ARCHITECTURE.md](./services/employee-service/ARCHITECTURE.md)
- [pointage-service/ARCHITECTURE.md](./services/pointage-service/ARCHITECTURE.md)
- [analytics-service/ARCHITECTURE.md](./services/analytics-service/ARCHITECTURE.md)
- [notif-service/ARCHITECTURE.md](./services/notif-service/ARCHITECTURE.md)

---

## 📋 Vérification Avant Push

- [ ] All controllers extend `BaseApiController`
- [ ] All responses use `respond*()`
- [ ] All exceptions extend `BaseApiException`
- [ ] All logging uses `LoggingService`
- [ ] All services use DTOs for complex parameters
- [ ] All validation uses `FormRequest` classes
- [ ] No `Log::debug()`, timing logs
- [ ] No sensible data in logs
- [ ] All methods have PHPDoc
- [ ] All types are strict

---

Generated: **20 March 2026**
