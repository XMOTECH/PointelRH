## 📋 Analytics Service Architecture

Cette documentation décrit l'architecture refactorisée du service Analytics.

### 📂 Structure

```
app/
├── Http/
│   └── Controllers/Api/
│       ├── BaseApiController.php       ← Contrôleur de base
│       └── AnalyticsController.php     ← Endpoints analytics
├── Services/
│   ├── KpiCacheService.php             ← Cache KPI
│   ├── DeduplicationService.php        ← Déduplication données
│   ├── SnapshotUpdater.php             ← Updates snapshots
│   └── LoggingService.php              ← Logs centralisés
├── Exceptions/
│   ├── BaseApiException.php
│   ├── ResourceNotFoundException.php
│   ├── InvalidDataException.php
│   ├── UnauthorizedException.php
│   ├── ForbiddenException.php
│   └── Models/
│       ├── KPI.php
│       └── Snapshot.php
```

### 🔄 Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/analytics/dashboard` | GET | Dashboard d'analytics du jour |
| `/api/analytics/presence-trend` | GET | Tendance de présence |

### ✅ Contrôleurs Refactorisés

| Contrôleur | Statut | Détails |
|-----------|--------|---------|
| AnalyticsController | ✅ | Dashboard et tendances refactorisés |

### 📊 Examples

#### Dashboard
```
GET /api/analytics/dashboard?date=2026-03-20
```

Response:
```json
{
  "success": true,
  "data": {
    "date": "2026-03-20",
    "totals": {
      "total_present": 150,
      "total_late": 20,
      "total_absent": 30,
      "avg_presence_rate": 78.5
    },
    "departments": [...]
  }
}
```

#### Presence Trend
```
GET /api/analytics/presence-trend?period=7d
```
